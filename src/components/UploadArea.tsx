import { useRef, useState } from 'react';
import { UploadCloud, FileText, X } from 'lucide-react';

interface UploadAreaProps {
  onFileSelected: (file: File) => void;
  onDemo: () => void;
  disabled?: boolean;
}

export function UploadArea({ onFileSelected, onDemo, disabled }: UploadAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const MAX_SIZE = 20 * 1024 * 1024; // 20 MB

  function validateFile(file: File): string | null {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      // Allow text files for demo-like scenarios, but primarily PDFs
      if (file.type.startsWith('text/')) return null;
      return 'Unsupported file type. Please upload a PDF document.';
    }
    if (file.size > MAX_SIZE) {
      return 'File is too large. Maximum size is 20 MB.';
    }
    return null;
  }

  function handleFile(file: File) {
    const err = validateFile(file);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setSelectedFile(file);
    onFileSelected(file);
  }

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (disabled) return;
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onClick={() => !disabled && !selectedFile && inputRef.current?.click()}
        className={`relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
          dragging
            ? 'border-brand-500 bg-brand-50 scale-[1.01]'
            : selectedFile
            ? 'border-emerald-400 bg-emerald-50/50'
            : 'border-slate-300 bg-slate-50/50 hover:border-brand-400 hover:bg-brand-50/30'
        } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf,text/plain"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">{selectedFile.name}</p>
              <p className="text-sm text-slate-500">
                {(selectedFile.size / 1024).toFixed(0)} KB · Ready for analysis
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                setError(null);
              }}
              className="mt-1 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
            >
              <X className="h-4 w-4" /> Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-xl transition-colors ${
                dragging ? 'bg-brand-100 text-brand-600' : 'bg-slate-200 text-slate-500'
              }`}
            >
              <UploadCloud className="h-7 w-7" />
            </div>
            <div>
              <p className="font-semibold text-slate-700">
                Drag & drop a contract PDF here
              </p>
              <p className="mt-1 text-sm text-slate-500">
                or click to browse — PDF up to 20 MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 animate-fade-in">
          {error}
        </div>
      )}

      <div className="mt-4 flex items-center justify-center">
        <button
          onClick={onDemo}
          disabled={disabled}
          className="inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 transition-all hover:bg-brand-100 disabled:opacity-50"
        >
          <FileText className="h-4 w-4" />
          Try Demo Contract
        </button>
      </div>
    </div>
  );
}
