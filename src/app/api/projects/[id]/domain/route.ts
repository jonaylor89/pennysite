import { NextResponse } from "next/server";
import {
  addCustomDomain,
  getCustomDomain,
  getDomainInstructions,
  removeCustomDomain,
} from "@/lib/cloudflare/domains";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

function isValidDomain(domain: string): boolean {
  const domainRegex =
    /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error: fetchError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !data) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const project = data as Project;

  if (!project.custom_domain || !project.cf_project_name) {
    return NextResponse.json({
      customDomain: null,
      status: null,
      instructions: null,
    });
  }

  const cfDomain = await getCustomDomain(
    project.cf_project_name,
    project.custom_domain,
  );

  const status = cfDomain?.status === "active" ? "active" : "pending";

  if (status !== project.custom_domain_status) {
    await supabase
      .from("projects")
      .update({ custom_domain_status: status })
      .eq("id", id)
      .eq("user_id", user.id);
  }

  const instructions = getDomainInstructions(
    project.cf_project_name,
    project.custom_domain,
  );

  return NextResponse.json({
    customDomain: project.custom_domain,
    status,
    cfStatus: cfDomain?.status,
    instructions,
    customDomainUrl: `https://${project.custom_domain}`,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { domain } = body as { domain: string };

  if (!domain || !isValidDomain(domain)) {
    return NextResponse.json(
      { error: "Invalid domain format" },
      { status: 400 },
    );
  }

  const normalizedDomain = domain.toLowerCase().trim();

  const { data, error: fetchError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !data) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const project = data as Project;

  if (!project.cf_project_name) {
    return NextResponse.json(
      { error: "Project must be published before adding a custom domain" },
      { status: 400 },
    );
  }

  try {
    const cfDomain = await addCustomDomain(
      project.cf_project_name,
      normalizedDomain,
    );

    const { error: updateError } = await supabase
      .from("projects")
      .update({
        custom_domain: normalizedDomain,
        custom_domain_status:
          cfDomain.status === "active" ? "active" : "pending",
        custom_domain_added_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to update project:", updateError);
    }

    const instructions = getDomainInstructions(
      project.cf_project_name,
      normalizedDomain,
    );

    return NextResponse.json({
      success: true,
      customDomain: normalizedDomain,
      status: cfDomain.status === "active" ? "active" : "pending",
      instructions,
      customDomainUrl: `https://${normalizedDomain}`,
    });
  } catch (error) {
    console.error("Add domain error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to add domain",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error: fetchError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !data) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const project = data as Project;

  if (!project.custom_domain || !project.cf_project_name) {
    return NextResponse.json(
      { error: "No custom domain configured" },
      { status: 400 },
    );
  }

  try {
    await removeCustomDomain(project.cf_project_name, project.custom_domain);

    const { error: updateError } = await supabase
      .from("projects")
      .update({
        custom_domain: null,
        custom_domain_status: null,
        custom_domain_added_at: null,
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to update project:", updateError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove domain error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to remove domain",
      },
      { status: 500 },
    );
  }
}
