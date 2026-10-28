import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const types: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await context.params;
  const filename = segments.join("/");
  if (!filename || segments.some((segment) => segment === ".." || segment.includes("\\"))) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    // Payload stores uploaded media in public/media, backed by Docker's media_data volume.
    const file = await readFile(path.join(process.cwd(), "public", "media", filename));
    return new NextResponse(file, {
      headers: {
        "Content-Type": types[path.extname(filename).toLowerCase()] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
