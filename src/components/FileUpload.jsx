import React, { useRef, useState } from 'react';
import { UploadCloud, Loader2, FileText, Image as ImageIcon, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function FileUpload({ onParsed, onError, criteria }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [stage, setStage] = useState('');
  const [fileName, setFileName] = useState('');

  const accepted = 'application/pdf,image/png,image/jpeg,image/jpg,image/webp';

  async function handleFile(file) {
    if (!file) return;
    if (!/pdf|png|jpe?g|webp/i.test(file.type) && !/\.(pdf|png|jpe?g|webp)$/i.test(file.name)) {
      onError?.('Please upload a PDF or image file (PDF, PNG, JPG, WEBP).');
      return;
    }
    setFileName(file.name);
    setIsWorking(true);
    setStage('Uploading file…');
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setStage('Reading timetable with AI…');
      const res = await base44.functions.invoke('parseTimetable', { file_url, criteria });
      onParsed?.(res.data?.events || [], file_url);
    } catch (err) {
      onError?.(err?.message || 'Failed to read the timetable. Please try again.');
    } finally {
      setIsWorking(false);
      setStage('');
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function clearFile() {
    setFileName('');
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={[
        'relative rounded-2xl border-2 border-dashed transition-all duration-300',
        'bg-white/60 backdrop-blur-sm',
        isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border',
        isWorking ? 'pointer-events-none' : ''
      ].join(' ')}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accepted}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div className="px-6 py-14 sm:py-20 text-center">
        {isWorking ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <div>
              <p className="text-base font-medium text-foreground">{stage}</p>
              {fileName && <p className="text-sm text-muted-foreground mt-1">{fileName}</p>}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center gap-4 w-full group"
          >
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <UploadCloud className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-base font-medium text-foreground">
                Drop your timetable here, or <span className="text-primary underline underline-offset-4">browse</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">PDF or image · PNG, JPG, WEBP</p>
            </div>
          </button>
        )}
      </div>

      {fileName && !isWorking && (
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-background/90 backdrop-blur border border-border rounded-full pl-3 pr-2 py-1.5 shadow-sm">
          {/\.(pdf)$/i.test(fileName) ? (
            <FileText className="w-3.5 h-3.5 text-primary" />
          ) : (
            <ImageIcon className="w-3.5 h-3.5 text-primary" />
          )}
          <span className="text-xs font-medium text-foreground max-w-[180px] truncate">{fileName}</span>
          <button
            onClick={clearFile}
            className="rounded-full p-1 hover:bg-muted transition-colors"
            aria-label="Remove file"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
}