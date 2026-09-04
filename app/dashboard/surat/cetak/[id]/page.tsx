'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';
import { ArrowLeft, Loader2, Printer, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PageProps {
  params: {
    id: string;
  };
}

export default function CetakSuratPage({ params }: PageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [surat, setSurat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Reference for the component to be printed
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSurat = async () => {
      try {
        const res = await fetch(`/api/surat/${params.id}`);
        const data = await res.json();
        if (res.ok) {
          setSurat(data);
        } else {
          toast({ title: 'Error', description: 'Surat tidak ditemukan', variant: 'destructive' });
        }
      } catch (e) {
        console.error('Error fetching letter details:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSurat();
  }, [params.id, toast]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: surat ? `Surat_${surat.nomor.replace(/\//g, '_')}` : 'Cetak_Surat',
    onAfterPrint: () => {
      toast({
        title: 'Sukses Mencetak',
        description: 'Dokumen berhasil disiapkan dalam format PDF.',
      });
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!surat) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-white mb-4">Surat Tidak Ditemukan</h2>
        <Button asChild className="bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950">
          <Link href="/dashboard/surat">Kembali ke Daftar Surat</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 p-4 border border-slate-800 rounded-xl">
        <Link 
          href="/dashboard/surat" 
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Kembali
        </Link>

        <div className="flex gap-2">
          <Button 
            onClick={handlePrint} 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
          >
            <Printer className="w-4 h-4 mr-2" />
            Cetak ke PDF
          </Button>
        </div>
      </div>

      {/* Printable Area (A4 Paper Simulation) */}
      <div className="overflow-x-auto pb-10">
        <div 
          ref={componentRef}
          className="bg-white text-black mx-auto shadow-2xl printable-document"
          style={{ 
            width: '210mm', 
            minHeight: '297mm', 
            padding: '20mm',
            boxSizing: 'border-box'
          }}
        >
          {/* KOP Surat DPM */}
          <div className="border-b-4 border-black pb-4 mb-8 flex items-center justify-between">
            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center shrink-0 border border-slate-300">
              {/* Placeholder Logo ITB */}
              <span className="text-[10px] font-bold text-slate-500 text-center">LOGO<br/>KAMPUS</span>
            </div>
            <div className="flex-1 text-center px-4">
              <h1 className="text-2xl font-black uppercase tracking-wider m-0">Dewan Perwakilan Mahasiswa</h1>
              <h2 className="text-xl font-bold uppercase m-0">Institut Teknologi Bisnis Riau</h2>
              <p className="text-sm mt-2 m-0">Jl. HR. Soebrantas, Komplek Ruko Royal Platinum, Pekanbaru, Riau</p>
              <p className="text-sm m-0">Email: dpm@itbriau.ac.id | Website: dpm.itbriau.ac.id</p>
            </div>
            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center shrink-0 border border-slate-300">
              {/* Placeholder Logo DPM */}
              <span className="text-[10px] font-bold text-slate-500 text-center">LOGO<br/>DPM</span>
            </div>
          </div>

          {/* Metadata Surat */}
          <div className="flex justify-between mb-8 text-base">
            <div>
              <table className="border-none">
                <tbody>
                  <tr>
                    <td className="pr-4 py-1">Nomor</td>
                    <td className="py-1">: {surat.nomor}</td>
                  </tr>
                  <tr>
                    <td className="pr-4 py-1">Lampiran</td>
                    <td className="py-1">: -</td>
                  </tr>
                  <tr>
                    <td className="pr-4 py-1">Perihal</td>
                    <td className="py-1 font-bold">: {surat.perihal}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="text-right">
              <p>Pekanbaru, {formatDate(surat.tanggal)}</p>
            </div>
          </div>

          {/* Tujuan Surat */}
          <div className="mb-10 text-base">
            <p>Kepada Yth,</p>
            <p className="font-bold">{surat.kepada}</p>
            <p>di Tempat</p>
          </div>

          {/* Isi Surat */}
          <div className="mb-16 text-base leading-loose text-justify whitespace-pre-wrap font-serif">
            {surat.isi_singkat}
          </div>

          {/* Penutup & Tanda Tangan */}
          <div className="flex justify-end mt-20 text-base">
            <div className="text-center">
              <p className="mb-24">Hormat Kami,<br/>Ketua DPM ITB Riau,</p>
              
              <p className="font-bold underline uppercase">{surat.created_by}</p>
              <p>NIM. 123456789</p>
            </div>
          </div>
          
          {/* Digital Signature Badge (V2.0 Feature) */}
          <div className="mt-20 pt-4 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Dokumen ini dicetak otomatis dari Sistem E-Office DPM Connect V2.0</span>
            </div>
            <div>
              ID Arsip: {surat.id.substring(0, 8).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background-color: white !important;
          }
          .printable-document {
            box-shadow: none !important;
            margin: 0 !important;
          }
        }
      `}} />
    </div>
  );
}
