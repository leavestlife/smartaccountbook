import React from 'react';
import { X } from 'lucide-react';
import { Card } from './Card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, description, children, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <Card 
        className="apple-card w-full max-w-md flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-200"
        style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
              {description && (
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{description}</p>
              )}
            </div>
            <button 
              onClick={onClose} 
              className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>
          
          <div className="py-2">
            {children}
          </div>

          {footer && (
            <div className="mt-6 flex justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
