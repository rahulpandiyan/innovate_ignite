import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { requireAuth } from "@/lib/apiHelpers";

const SERVICE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_SCREENSHOT_BUCKET || "screenshots";

let client: SupabaseClient | null = null;

function serviceClient(): SupabaseClient {
  if (!client) {
    if (!SERVICE_URL || !SERVICE_KEY) {
      throw new Error("Missing Supabase Storage env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }
    client = createClient(SERVICE_URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

async function ensureBucket(sb: SupabaseClient) {
  const { data: buckets, error: listErr } = await sb.storage.listBuckets();
  if (listErr) throw listErr;
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    const { error: createErr } = await sb.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: "5mb",
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
    });
    if (createErr) throw createErr;
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth.error) return auth.error;

  let sb: SupabaseClient;
  try {
    sb = serviceClient();
  } catch (err) {
    const e = err as Error;
    return NextResponse.json(
      { success: false, error: { message: e.message } },
      { status: 500 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { success: false, error: { message: "Expected multipart/form-data (file)." } },
      { status: 400 }
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { success: false, error: { message: "No file field named 'file' in the request." } },
      { status: 400 }
    );
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { success: false, error: { message: "Screenshot must be under 5MB." } },
      { status: 413 }
    );
  }

  const allowed = ["image/png", "image/jpeg", "image/webp"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json(
      { success: false, error: { message: "Only PNG, JPEG or WebP screenshots are allowed." } },
      { status: 415 }
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const safeTs = Date.now();
  const safeIds = auth.session.id.slice(0, 8);
  const path = `${auth.session.id}/${safeTs}-${safeIds}.${file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"}`;

  try {
    await ensureBucket(sb);
    const { data, error } = await sb.storage
      .from(BUCKET)
      .upload(path, bytes, {
        contentType: file.type,
        upsert: false,
      });
    if (error) throw error;

    const { data: pubInfo } = sb.storage
      .from(BUCKET)
      .getPublicUrl(data.path);

    return NextResponse.json({ success: true, data: { url: pubInfo.publicUrl } });
  } catch (err) {
    const e = err as Error;
    return NextResponse.json(
      { success: false, error: { message: e.message || "Upload failed." } },
      { status: 500 }
    );
  }
}
