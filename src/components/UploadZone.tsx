import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '../lib/utils';
import { parseExcel } from '../lib/parser';
import { useFinance } from '../lib/store';

export function UploadZone() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { addTransactions } = useFinance();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const processFiles = async (files: FileList) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    
    try {
      const fileArray = Array.from(files).filter(f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.csv'));
      for (const file of fileArray) {
        const txs = await parseExcel(file);
        addTransactions(txs);
      }
    } catch (err) {
      alert("파일을 분석하는 중 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setIsProcessing(false);
      setIsDragOver(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    await processFiles(e.dataTransfer.files);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(e.target.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex items-center justify-center w-full border-2 border-dashed rounded-3xl transition-all duration-300 overflow-hidden",
        isDragOver 
          ? "border-blue-500 bg-blue-500/10" 
          : "border-gray-300 backdrop-blur-xl bg-white/20 dark:bg-black/20 hover:border-blue-400"
      )}
      style={{
        borderRadius: "24px",
        borderWidth: "2px",
        borderColor: isDragOver ? "var(--accent-primary)" : "var(--border-color)",
        backgroundColor: isDragOver ? "rgba(0, 122, 255, 0.05)" : "var(--surface-color)",
        boxShadow: "var(--shadow-sm)",
        minHeight: "120px",
      }}
    >
      <input 
        type="file" 
        multiple 
        accept=".xlsx,.xls,.csv" 
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      
      <div className="flex items-center justify-center gap-6 p-4">
        <div 
          className="flex items-center justify-center w-12 h-12 rounded-full shrink-0"
          style={{ backgroundColor: "rgba(0, 122, 255, 0.1)" }}
        >
          <UploadCloud className="w-6 h-6" style={{ color: "var(--accent-primary)" }} />
        </div>
        <div className="text-left">
          <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            {isProcessing ? "분석 중..." : "엑셀 파일을 여기에 드롭하세요"}
          </h3>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            카드 명세서, 은행 입출금 내역 (다중 파일 지원)
          </p>
        </div>
        <button 
          className="apple-btn apple-btn-default pointer-events-none hidden sm:block"
          style={{ whiteSpace: "nowrap" }}
        >
          파일 선택
        </button>
      </div>
    </div>
  );
}
