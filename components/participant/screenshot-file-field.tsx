"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { UploadCloud, CheckCircle2, X } from "lucide-react";

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
  const [progress, setProgress] = React.useState(0);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setProgress(0);

    const fd = new FormData();
    fd.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/screenshots/upload");
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) {
        setProgress(Math.round((ev.loaded / ev.total) * 100));
      }
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          onChange(data.data.url);
          toast.success("Screenshot uploaded");
        } else {
          toast.error(data.error?.message ?? "Upload failed.");
        }
      } catch {
        toast.error("Upload failed.");
      } finally {
        setUploading(false);
        setProgress(0);
        if (inputRef.current) inputRef.current.value = "";
      }
    };
    xhr.onerror = () => {
      toast.error("Upload failed. Check your connection.");
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    };
    xhr.send(fd);
  }

  function handleRemove() {
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
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
        {value && !uploading && (
          <button type="button" onClick={handleRemove} className="shrink-0 text-slate-400 hover:text-red-500">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {uploading && (
        <div className="space-y-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-blue-600">Uploading... {progress}%</p>
        </div>
      )}
      {value && !uploading && (
        <p className="text-[10px] text-emerald-700">
          Screenshot uploaded successfully
        </p>
      )}
    </div>
  );
}
