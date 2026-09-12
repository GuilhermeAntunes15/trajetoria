import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { canViewProject } from "@/lib/permissions";
import { qrPngBuffer } from "@/lib/qrcode";
import { getViewer } from "@/lib/session";
import { getProjectCtxBySlug } from "@/server/services/project.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [viewer, project] = await Promise.all([getViewer(), getProjectCtxBySlug(slug)]);

  const permissionViewer = viewer
    ? { id: viewer.id, role: viewer.role, schoolId: viewer.schoolId }
    : null;

  if (!project || !canViewProject(permissionViewer, project)) {
    return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });
  }

  const png = await qrPngBuffer(`${env.APP_URL}/projects/${project.slug}`);
  const download = new URL(request.url).searchParams.get("download") === "1";

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Length": String(png.byteLength),
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": download
        ? `attachment; filename="qr-${project.slug}.png"`
        : "inline",
    },
  });
}
