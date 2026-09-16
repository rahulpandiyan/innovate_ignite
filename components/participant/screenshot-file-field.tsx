"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UploadCloud, CheckCircle2 } from "lucide-react";

// Shared file-upload picker for payment screenshots.
// Uploads to Supabase Storage (service role) and exposes the resulting
// public URL — exactly what the existing .env payloads / DB column expect.
export function ScreenshotFileField({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/screenshots/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Upload failed.");
      onChange(data.data.url);
      toast.success("Screenshot uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Payment screenshot</Label>
      <div
        className={`flex items-center gap-3 rounded-lg border-2 border-dashed px-3 py-2 transition-colors ${
          value ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50"
        }`}
      >
        {value ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
        ) : (
          <UploadCloud className={`h-4 w-4 shrink-0 ${uploading ? "animate-pulse text-blue-500" : "text-slate-400"}`} />
        )}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-black"
          onChange={handleFile}
          disabled={uploading}
        />
      </div>
      {value && (
        <p className="break-all font-mono text-[10px] text-emerald-700">
          {uploading ? "Uploading…" : `Uploaded: ${value.slice(0, 60)}${value.length > 60 ? "…" : ""}`}
        </p>
      )}
    </div>
  );
}
