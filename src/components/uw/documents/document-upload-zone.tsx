"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UwDocType } from "@prisma/client";
import { Upload, FileCheck2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UW_DOC_TYPE_LABELS } from "@/lib/constants";

interface DocumentUploadZoneProps {
  apiBase: string; // e.g. "/api/uw/applications/abc" or "/api/apply/<token>"
  defaultDocType?: UwDocType;
  onUploaded?: () => void;
}

interface FileQueueItem {
  id: string;
  file: File;
  status: "queued" | "uploading" | "done" | "error";
  error?: string;
}

export function DocumentUploadZone({
  apiBase,
  defaultDocType = UwDocType.BANK_STATEMENT,
  onUploaded,
}: DocumentUploadZoneProps) {
  const [docType, setDocType] = useState<UwDocType>(defaultDocType);
  const [queue, setQueue] = useState<FileQueueItem[]>([]);

  const uploadFile = useCallback(
    async (item: FileQueueItem) => {
      setQueue((q) =>
        q.map((i) => (i.id === item.id ? { ...i, status: "uploading" } : i))
      );

      try {
        const presignResp = await fetch(`${apiBase}/upload-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            docType,
            filename: item.file.name,
            contentType: item.file.type || "application/octet-stream",
            sizeBytes: item.file.size,
          }),
        });
        if (!presignResp.ok) {
          const body = await presignResp.json().catch(() => ({}));
          throw new Error(body.error || "Failed to get upload URL");
        }
        const presigned = await presignResp.json();

        const putResp = await fetch(presigned.url, {
          method: presigned.method,
          headers: presigned.headers,
          body: item.file,
        });
        if (!putResp.ok) throw new Error("Upload failed");

        const regResp = await fetch(`${apiBase}/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            docType,
            s3Key: presigned.key,
            filename: item.file.name,
            contentType: item.file.type || "application/octet-stream",
            sizeBytes: item.file.size,
          }),
        });
        if (!regResp.ok) throw new Error("Failed to register document");

        setQueue((q) =>
          q.map((i) => (i.id === item.id ? { ...i, status: "done" } : i))
        );
        onUploaded?.();
      } catch (e) {
        setQueue((q) =>
          q.map((i) =>
            i.id === item.id
              ? { ...i, status: "error", error: (e as Error).message }
              : i
          )
        );
      }
    },
    [apiBase, docType, onUploaded]
  );

  const onDrop = useCallback(
    (accepted: File[]) => {
      const items = accepted.map<FileQueueItem>((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        status: "queued",
      }));
      setQueue((q) => [...q, ...items]);
      items.forEach((it) => uploadFile(it));
    },
    [uploadFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    maxSize: 25 * 1024 * 1024,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-navy-800">
          Document type
          <select
            className="rounded-md border border-border bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
            value={docType}
            onChange={(e) => setDocType(e.target.value as UwDocType)}
          >
            {Object.entries(UW_DOC_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-steel-500">
          PDF, PNG, or JPG. Up to 25&nbsp;MB per file.
        </p>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          isDragActive
            ? "border-navy-500 bg-navy-50"
            : "border-steel-200 bg-steel-50/50 hover:border-navy-300 hover:bg-navy-50/40"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 text-navy-500" />
        <p className="mt-3 text-sm font-medium text-navy-800">
          {isDragActive
            ? "Drop the files to upload"
            : "Drag and drop, or click to choose files"}
        </p>
        <p className="mt-1 text-xs text-steel-500">
          Bank statements, ID, voided check, signed app, anything else
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={(e) => e.stopPropagation()}
        >
          Browse files
        </Button>
      </div>

      {queue.length > 0 && (
        <ul className="space-y-1.5">
          {queue.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-md border border-border/60 bg-white px-3 py-2 text-sm"
            >
              <div className="min-w-0 flex-1 truncate">
                <p className="truncate font-medium text-navy-800">
                  {item.file.name}
                </p>
                <p className="text-[11px] text-steel-500">
                  {UW_DOC_TYPE_LABELS[docType]} · {Math.round(item.file.size / 1024)} KB
                </p>
              </div>
              <div className="ml-3 flex shrink-0 items-center gap-1.5 text-xs">
                {item.status === "uploading" && (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-navy-500" />
                    <span className="text-steel-500">Uploading…</span>
                  </>
                )}
                {item.status === "done" && (
                  <>
                    <FileCheck2 className="h-3.5 w-3.5 text-profit" />
                    <span className="text-profit">Uploaded</span>
                  </>
                )}
                {item.status === "error" && (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 text-danger" />
                    <span className="text-danger">{item.error}</span>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
