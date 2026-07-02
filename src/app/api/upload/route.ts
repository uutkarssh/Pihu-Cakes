import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg"]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file)
    return NextResponse.json({ error: "No file" }, { status: 400 });

  // Admin uploads (product images) require auth
  const kind = (form.get("kind") as string) || "review";
  if (kind === "product" && !(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // File size check
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  // File type validation
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json(
      { error: `File type not allowed. Allowed: ${[...ALLOWED_EXTENSIONS].join(", ")}` },
      { status: 400 }
    );
  }

  // For SVG files, sanitize by checking for script tags (basic XSS prevention)
  if (ext === "svg") {
    const arrayBuf = await file.arrayBuffer();
    const text = new TextDecoder().decode(arrayBuf);
    if (/<script[\s>]/i.test(text) || /on\w+\s*=/i.test(text)) {
      return NextResponse.json({ error: "SVG contains unsafe content" }, { status: 400 });
    }
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const name = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), buf);
  return NextResponse.json({ url: `/uploads/${name}` });
}