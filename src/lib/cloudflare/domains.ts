const CLOUDFLARE_API_URL = "https://api.cloudflare.com/client/v4";

type CloudflareResponse<T> = {
  success: boolean;
  errors?: Array<{ code: number; message: string }>;
  messages?: Array<{ code: number; message: string }>;
  result: T;
};

type PagesDomain = {
  id: string;
  name: string;
  status: "pending" | "active" | "moved" | "deleting" | "deleted";
  verification_type: "cname" | "txt";
  validation_data: {
    status: string;
    method: string;
  };
  certificate_authority: string;
  created_on: string;
  zone_tag?: string;
};

function getCredentials() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error("Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN");
  }

  return { accountId, apiToken };
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

export async function addCustomDomain(
  cfProjectName: string,
  domain: string,
): Promise<PagesDomain> {
  const { accountId } = getCredentials();

  const response = await cfFetch<PagesDomain>(
    `/accounts/${accountId}/pages/projects/${cfProjectName}/domains`,
    {
      method: "POST",
      body: JSON.stringify({ name: domain }),
    },
  );

  if (!response.success) {
    throw new Error(`Failed to add domain: ${formatError(response)}`);
  }

  return response.result;
}

export async function getCustomDomain(
  cfProjectName: string,
  domain: string,
): Promise<PagesDomain | null> {
  const { accountId } = getCredentials();

  const response = await cfFetch<PagesDomain>(
    `/accounts/${accountId}/pages/projects/${cfProjectName}/domains/${encodeURIComponent(domain)}`,
  );

  if (!response.success) {
    return null;
  }

  return response.result;
}

export async function listCustomDomains(
  cfProjectName: string,
): Promise<PagesDomain[]> {
  const { accountId } = getCredentials();

  const response = await cfFetch<PagesDomain[]>(
    `/accounts/${accountId}/pages/projects/${cfProjectName}/domains`,
  );

  if (!response.success) {
    throw new Error(`Failed to list domains: ${formatError(response)}`);
  }

  return response.result;
}

export async function retryDomainValidation(
  cfProjectName: string,
  domain: string,
): Promise<PagesDomain> {
  const { accountId } = getCredentials();

  const response = await cfFetch<PagesDomain>(
    `/accounts/${accountId}/pages/projects/${cfProjectName}/domains/${encodeURIComponent(domain)}`,
    {
      method: "PATCH",
    },
  );

  if (!response.success) {
    throw new Error(`Failed to retry validation: ${formatError(response)}`);
  }

  return response.result;
}

export async function removeCustomDomain(
  cfProjectName: string,
  domain: string,
): Promise<void> {
  const { accountId } = getCredentials();

  const response = await cfFetch<unknown>(
    `/accounts/${accountId}/pages/projects/${cfProjectName}/domains/${encodeURIComponent(domain)}`,
    {
      method: "DELETE",
    },
  );

  if (!response.success) {
    throw new Error(`Failed to remove domain: ${formatError(response)}`);
  }
}

export function getDomainInstructions(
  cfProjectName: string,
  domain: string,
): {
  type: "CNAME";
  host: string;
  target: string;
  instructions: string;
} {
  const isApex = !domain.includes(".") || domain.split(".").length === 2;

  return {
    type: "CNAME",
    host: isApex ? "@" : domain.split(".")[0],
    target: `${cfProjectName}.pages.dev`,
    instructions: isApex
      ? `Add a CNAME record for your apex domain pointing to ${cfProjectName}.pages.dev. Note: Your domain must use Cloudflare DNS for apex domains.`
      : `Add a CNAME record for "${domain.split(".")[0]}" pointing to ${cfProjectName}.pages.dev`,
  };
}
