'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  actionVariant?: 'danger' | 'primary' | 'warning';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Hapus',
  cancelText = 'Batal',
  isLoading = false,
  actionVariant = 'danger',
}: ConfirmDialogProps) {
  
  const getActionClass = () => {
    switch (actionVariant) {
      case 'primary': return 'bg-blue-600 text-white hover:bg-blue-700 font-bold';
      case 'warning': return 'bg-amber-600 text-white hover:bg-amber-700 font-bold';
      case 'danger': 
      default:
        return 'bg-red-600 text-white hover:bg-red-700 font-bold';
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-slate-900 border border-slate-800 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            disabled={isLoading}
            className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault(); // prevent auto-close if loading
              onConfirm();
            }}
            disabled={isLoading}
            className={getActionClass()}
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
