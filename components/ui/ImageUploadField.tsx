'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { api, mediaUrl } from '@/lib/api';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
  aspectRatio?: 'video' | 'square' | 'auto';
}

export default function ImageUploadField({ 
  value, 
  onChange, 
  label = 'Image',
  className = '',
  aspectRatio = 'video'
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB.');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api<{ url: string }>('/api/upload/image', {
        method: 'POST',
        body: formData,
        auth: true,
      });
      onChange(res.url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const aspectClass = 
    aspectRatio === 'video' ? 'aspect-video' : 
    aspectRatio === 'square' ? 'aspect-square' : '';

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-sm font-medium text-navy">{label}</label>}
      
      {error && <p className="text-sm text-red-500">{error}</p>}
      
      <div className={`relative border-2 border-dashed border-border rounded-xl overflow-hidden flex flex-col items-center justify-center bg-soft-blue hover:bg-soft-blue/80 transition-colors ${aspectClass} ${!aspectClass ? 'min-h-[200px]' : ''}`}>
        
        {value ? (
          <>
            <Image 
              src={mediaUrl(value)} 
              alt="Uploaded preview" 
              fill 
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-navy p-2 rounded-full hover:bg-gray-100 shadow-sm"
                title="Change Image"
              >
                <Upload size={18} />
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-sm"
                title="Remove Image"
              >
                <X size={18} />
              </button>
            </div>
          </>
        ) : (
          <div 
            className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-6 text-center"
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center text-school-blue">
                <Loader2 size={32} className="animate-spin mb-2" />
                <span className="text-sm font-medium">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-text-muted hover:text-school-blue transition-colors">
                <ImageIcon size={32} className="mb-2 opacity-50" />
                <span className="text-sm font-medium">Click to upload image</span>
                <span className="text-xs mt-1 opacity-70">JPG, PNG, WEBP (max 5MB)</span>
              </div>
            )}
          </div>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
        />
      </div>
    </div>
  );
}
