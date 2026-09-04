'use client';

import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Eraser, Check, Undo2 } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureDataUrl: string | null) => void;
  width?: number;
  height?: number;
}

export function SignaturePad({ onSave, width = 400, height = 200 }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const [savedData, setSavedData] = useState<string | null>(null);

  const clear = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
    setSavedData(null);
    onSave(null);
  };

  const save = () => {
    if (sigCanvas.current?.isEmpty()) {
      alert("Tanda tangan masih kosong!");
      return;
    }
    const dataUrl = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png');
    if (dataUrl) {
      setSavedData(dataUrl);
      onSave(dataUrl);
    }
  };

  const handleEnd = () => {
    setIsEmpty(false);
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-md">
      {!savedData ? (
        <>
          <div className="border-2 border-dashed border-slate-700 rounded-lg bg-white overflow-hidden shadow-inner">
            <SignatureCanvas 
              ref={sigCanvas}
              penColor="black"
              canvasProps={{
                width: width, 
                height: height, 
                className: 'signature-canvas cursor-crosshair'
              }}
              onEnd={handleEnd}
            />
          </div>
          
          <div className="flex gap-2 w-full justify-between mt-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={clear}
              className="text-slate-400 border-slate-700 hover:text-red-400 hover:bg-slate-900 w-1/2"
            >
              <Eraser className="w-4 h-4 mr-2" /> Ulangi
            </Button>
            <Button 
              type="button" 
              size="sm" 
              onClick={save}
              disabled={isEmpty}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold w-1/2"
            >
              <Check className="w-4 h-4 mr-2" /> Simpan TTD
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="p-4 bg-white rounded-lg border-2 border-emerald-500/30 flex justify-center w-full shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={savedData} alt="Tanda Tangan" className="max-h-32 object-contain" />
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={clear}
            className="text-slate-400 border-slate-700 hover:text-red-400 hover:bg-slate-900 w-full"
          >
            <Undo2 className="w-4 h-4 mr-2" /> Ganti Tanda Tangan
          </Button>
        </div>
      )}
    </div>
  );
}
