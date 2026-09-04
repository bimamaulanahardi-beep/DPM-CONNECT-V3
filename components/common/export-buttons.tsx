'use client';

import React from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Button } from '@/components/ui/button';
import { FileText, FileSpreadsheet } from 'lucide-react';

interface Column {
  header: string;
  dataKey: string;
}

interface ExportButtonsProps {
  data: any[];
  filename: string;
  columns: Column[];
}

export function ExportButtons({ data, filename, columns }: ExportButtonsProps) {
  const handleExportExcel = () => {
    const formattedData = data.map(item => {
      const row: any = {};
      columns.forEach(col => {
        row[col.header] = item[col.dataKey] || '-';
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('landscape');
    
    doc.text(`Laporan ${filename}`, 14, 15);
    
    const tableData = data.map(item => {
      return columns.map(col => item[col.dataKey] || '-');
    });

    (doc as any).autoTable({
      head: [columns.map(col => col.header)],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [245, 158, 11] } // amber-500
    });

    doc.save(`${filename}.pdf`);
  };

  if (!data || data.length === 0) return null;

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExportExcel} className="border-slate-700 bg-slate-900 text-green-500 hover:text-green-400 hover:bg-slate-800 h-10 px-3 flex items-center gap-1.5">
        <FileSpreadsheet className="w-4 h-4" />
        <span className="hidden sm:inline font-semibold">Export Excel</span>
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportPDF} className="border-slate-700 bg-slate-900 text-red-500 hover:text-red-400 hover:bg-slate-800 h-10 px-3 flex items-center gap-1.5">
        <FileText className="w-4 h-4" />
        <span className="hidden sm:inline font-semibold">Export PDF</span>
      </Button>
    </div>
  );
}
