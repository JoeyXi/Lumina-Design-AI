import React, { useCallback } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImageUpload: (base64: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        onImageUpload(result);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[400px] bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer relative group">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="flex flex-col items-center space-y-4 text-slate-500 group-hover:text-indigo-600 transition-colors">
        <div className="p-4 bg-white rounded-full shadow-sm group-hover:shadow-md transition-shadow">
          <UploadCloud size={48} />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Click or Drag to Upload Room Photo</p>
          <p className="text-sm opacity-75">Supports JPG, PNG</p>
        </div>
      </div>
      
      {/* Demo image option */}
      <div className="absolute bottom-4 text-xs text-slate-400">
        Or try a <span className="underline z-20 relative" onClick={(e) => {
             // Prevent file input trigger
             e.stopPropagation();
             // Normally would load a preset, but keeping it simple for now
        }}>demo image</span>
      </div>
    </div>
  );
};
