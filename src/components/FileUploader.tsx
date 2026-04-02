import React, { useRef } from 'react';
import { Upload, X, File as FileIcon, Image as ImageIcon } from 'lucide-react';

interface FileUploaderProps {
  files: { data: string; mimeType: string; name: string }[];
  setFiles: React.Dispatch<React.SetStateAction<{ data: string; mimeType: string; name: string }[]>>;
  label?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ files, setFiles, label = "Adjuntar archivos (PDF, Imágenes, etc.)" }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    Array.from(selectedFiles).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFiles(prev => [...prev, {
          data: base64,
          mimeType: file.type,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-400">{label}</label>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
        >
          <Upload className="w-3 h-3" /> Subir
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
          accept="image/*,application/pdf,text/plain"
        />
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-black border border-neutral-800 p-2 rounded-lg group">
              <div className="flex items-center gap-2 overflow-hidden">
                {file.mimeType.startsWith('image/') ? (
                  <ImageIcon className="w-4 h-4 text-orange-500 shrink-0" />
                ) : (
                  <FileIcon className="w-4 h-4 text-blue-500 shrink-0" />
                )}
                <span className="text-xs truncate text-gray-300">{file.name}</span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-neutral-800 rounded text-gray-500 hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
