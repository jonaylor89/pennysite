import crypto from "node:crypto";

const CLOUDFLARE_API_URL = "https://api.cloudflare.com/client/v4";

type CloudflareResponse<T> = {
  success: boolean;
  errors?: Array<{ code: number; message: string }>;
  messages?: Array<{ code: number; message: string }>;
  result: T;
};

type PagesProject = {
  id: string;
  name: string;
  subdomain: string;
  domains: string[];
  canonical_deployment?: {
    url: string;
  };
};

type Deployment = {
  id: string;
  url: string;
  environment: string;
  aliases: string[];
};

type UploadTokenResult = {
  jwt: string;
};

type UploadResult = {
  successful_key_count: number;
  unsuccessful_keys: string[];
};

interface FileInfo {
  path: string;
  content: Buffer;
  contentType: string;
  hash: string;
}

function getCredentials() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error("Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN");
  }

  return { accountId, apiToken };
}

function generateProjectName(projectId: string, projectName: string): string {
  const slug = projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 20);

  const suffix = projectId.slice(0, 8);
  return `${slug}-${suffix}`;
}

function formatError(res: CloudflareResponse<unknown>): string {
  if (res.errors && res.errors.length > 0) {
    return res.errors.map((e) => e.message).join(", ");
  }
  return "Unknown error";
}

async function cfFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<CloudflareResponse<T>> {
  const { apiToken } = getCredentials();

  const response = await fetch(`${CLOUDFLARE_API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();
  return data as CloudflareResponse<T>;
}

export async function getOrCreateProject(
  projectId: string,
  projectName: string,
): Promise<PagesProject> {
  const { accountId } = getCredentials();
  const cfProjectName = generateProjectName(projectId, projectName);

  const existing = await cfFetch<PagesProject>(
    `/accounts/${accountId}/pages/projects/${cfProjectName}`,
  );

  if (existing.success && existing.result) {
    return existing.result;
  }

  const created = await cfFetch<PagesProject>(
    `/accounts/${accountId}/pages/projects`,
    {
      method: "POST",
      body: JSON.stringify({
        name: cfProjectName,
        production_branch: "main",
      }),
    },
  );

  if (!created.success) {
    throw new Error(`Failed to create project: ${formatError(created)}`);
  }

  return created.result;
}

function hashFile(path: string, content: Buffer): string {
  const base64Content = content.toString("base64");
  return crypto
    .createHash("sha256")
    .update(base64Content + path)
    .digest("hex")
    .slice(0, 32);
}

function getContentType(filename: string): string {
  if (filename.endsWith(".html")) return "text/html";
  if (filename.endsWith(".css")) return "text/css";
  if (filename.endsWith(".js")) return "application/javascript";
  if (filename.endsWith(".json")) return "application/json";
  if (filename.endsWith(".svg")) return "image/svg+xml";
  if (filename.endsWith(".png")) return "image/png";
  if (filename.endsWith(".jpg") || filename.endsWith(".jpeg"))
    return "image/jpeg";
  return "application/octet-stream";
}

async function getUploadToken(
  accountId: string,
  apiToken: string,
  cfProjectName: string,
): Promise<string> {
  const response = await fetch(
    `${CLOUDFLARE_API_URL}/accounts/${accountId}/pages/projects/${cfProjectName}/upload-token`,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    },
  );

  const data = (await response.json()) as CloudflareResponse<UploadTokenResult>;

  if (!data.success || !data.result?.jwt) {
    throw new Error(`Failed to get upload token: ${formatError(data)}`);
  }

  return data.result.jwt;
}

async function uploadFiles(
  uploadToken: string,
  files: FileInfo[],
): Promise<void> {
  const uploadPayload = files.map((file) => ({
    key: file.hash,
    value: file.content.toString("base64"),
    metadata: { contentType: file.contentType },
    base64: true,
  }));

  const response = await fetch(`${CLOUDFLARE_API_URL}/pages/assets/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${uploadToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(uploadPayload),
  });

  const data = (await response.json()) as CloudflareResponse<UploadResult>;

  if (!data.success) {
    throw new Error(`Failed to upload files: ${formatError(data)}`);
  }

  if (data.result.unsuccessful_keys.length > 0) {
    throw new Error(
      `Some files failed to upload: ${data.result.unsuccessful_keys.join(", ")}`,
    );
  }
}

async function upsertHashes(
  uploadToken: string,
  hashes: string[],
): Promise<void> {
  const response = await fetch(
    `${CLOUDFLARE_API_URL}/pages/assets/upsert-hashes`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${uploadToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ hashes }),
    },
  );

  const data = (await response.json()) as { success: boolean };

  if (!data.success) {
    throw new Error("Failed to upsert hashes");
  }
}

async function createDeployment(
  accountId: string,
  apiToken: string,
  cfProjectName: string,
  manifest: Record<string, string>,
): Promise<string> {
  const formData = new FormData();
  formData.append("manifest", JSON.stringify(manifest));

  const response = await fetch(
    `${CLOUDFLARE_API_URL}/accounts/${accountId}/pages/projects/${cfProjectName}/deployments`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body: formData,
    },
  );

  const data = (await response.json()) as CloudflareResponse<Deployment>;

  if (!response.ok || !data.success) {
    throw new Error(`Deployment failed: ${formatError(data)}`);
  }

  return data.result.url || `https://${cfProjectName}.pages.dev`;
}

export async function deployPages(
  cfProjectName: string,
  pages: Record<string, string>,
): Promise<{ url: string }> {
  const { accountId, apiToken } = getCredentials();

  const files: FileInfo[] = Object.entries(pages).map(([filename, content]) => {
    const path = filename.startsWith("/") ? filename : `/${filename}`;
    const contentBuffer = Buffer.from(content, "utf-8");
    return {
      path,
      content: contentBuffer,
      contentType: getContentType(filename),
      hash: hashFile(path, contentBuffer),
    };
  });

  const uploadToken = await getUploadToken(accountId, apiToken, cfProjectName);

  await uploadFiles(uploadToken, files);

  const hashes = files.map((f) => f.hash);
  await upsertHashes(uploadToken, hashes);

  const manifest: Record<string, string> = {};
  for (const file of files) {
    manifest[file.path] = file.hash;
  }

  const url = await createDeployment(
    accountId,
    apiToken,
    cfProjectName,
    manifest,
  );

  return { url };
}

export async function publishToCloudflare(
  projectId: string,
  projectName: string,
  pages: Record<string, string>,
): Promise<{ cfProjectName: string; deployedUrl: string }> {
  const project = await getOrCreateProject(projectId, projectName);
  const { url } = await deployPages(project.name, pages);

  return {
    cfProjectName: project.name,
    deployedUrl: url,
  };
}

export async function deleteProject(cfProjectName: string): Promise<void> {
  const { accountId } = getCredentials();

  const response = await cfFetch<unknown>(
    `/accounts/${accountId}/pages/projects/${cfProjectName}`,
    {
      method: "DELETE",
    },
  );

  if (!response.success) {
    throw new Error(`Failed to delete project: ${formatError(response)}`);
  }
}
