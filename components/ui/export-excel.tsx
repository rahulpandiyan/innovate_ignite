"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

type Props = {
  data: Record<string, unknown>[];
  filename: string;
  sheetName?: string;
  label?: string;
  disabled?: boolean;
};

export function ExportExcelButton({ data, filename, sheetName = "Sheet1", label = "Export to Excel", disabled }: Props) {
  const handleExport = () => {
    if (!data.length) return;
    const ws = XLSX.utils.json_to_sheet(data);
    // auto width
    const cols = Object.keys(data[0] ?? {});
    ws["!cols"] = cols.map((k) => ({
      wch: Math.min(40, Math.max(k.length + 2, ...data.map((r) => String((r as Record<string, unknown>)[k] ?? "").length + 2))),
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || data.length === 0}
      className="gap-1.5 rounded-full"
      title={data.length === 0 ? "No data to export" : `Export ${data.length} rows`}
    >
      <Download className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}
