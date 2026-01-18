import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from './ui/Button';
import { compressImage } from '../services/imageUtils';
import { uploadToR2 } from '../services/storage';
import { supabase } from '../services/supabase';
import { UploadProgress } from '../types';

interface PhotoUploadProps {
  weddingId: string;
  slug: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ weddingId, slug }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploaderName, setUploaderName] = useState('');
  const [uploadQueue, setUploadQueue] = useState<UploadProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    if (!uploaderName.trim()) {
      alert("Please enter your nickname first!");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    const files: File[] = Array.from(e.target.files);
    
    // Initialize progress tracking
    const newQueue: UploadProgress[] = files.map(f => ({
      fileName: f.name,
      progress: 0,
      status: 'compressing'
    }));
    setUploadQueue(newQueue);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const timestamp = Date.now();
      const uniqueId = Math.random().toString(36).substring(7);
      
      try {
        // 1. Client-side Compression
        const compressedBlob = await compressImage(file);
        
        updateStatus(i, 'uploading', 30);

        // 2. Dual-Track Upload (Parallel)
        // Path structure: {slug}/{type}/{timestamp}_{id}.{ext}
        const originalPath = `${slug}/original/${timestamp}_${uniqueId}_${file.name}`;
        const compressedPath = `${slug}/compressed/${timestamp}_${uniqueId}.webp`;

        const [originalUrl, displayUrl] = await Promise.all([
          uploadToR2(file, originalPath, file.type),
          uploadToR2(compressedBlob, compressedPath, 'image/webp')
        ]);

        updateStatus(i, 'uploading', 80);

        // 3. Save to Supabase
        const { error } = await supabase.from('photos').insert({
          wedding_id: weddingId,
          uploader_name: uploaderName,
          original_url: originalUrl,
          display_url: displayUrl,
        });

        if (error) throw error;
        updateStatus(i, 'completed', 100);

      } catch (err) {
        console.error("Upload failed", err);
        updateStatus(i, 'error', 0);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    // Clear queue after delay
    setTimeout(() => setUploadQueue([]), 3000);
  };

  const updateStatus = (index: number, status: UploadProgress['status'], progress: number) => {
    setUploadQueue(prev => {
      const next = [...prev];
      next[index] = { ...next[index], status, progress };
      return next;
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 my-6">
      <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center">
        <Camera className="w-5 h-5 mr-2 text-rose-500" />
        Share Photos
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1">
            Your Nickname <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={uploaderName}
            onChange={(e) => setUploaderName(e.target.value)}
            placeholder="E.g., Uncle Bob"
            className="w-full px-4 py-2 rounded-md border border-stone-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
            disabled={isUploading}
          />
        </div>

        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <Button 
            onClick={() => fileInputRef.current?.click()} 
            className="w-full"
            disabled={isUploading || !uploaderName.trim()}
          >
            {isUploading ? 'Uploading...' : 'Select Photos'}
          </Button>
        </div>

        {uploadQueue.length > 0 && (
          <div className="mt-4 space-y-2">
            {uploadQueue.map((item, idx) => (
              <div key={idx} className="bg-stone-50 p-2 rounded text-sm">
                <div className="flex justify-between mb-1">
                  <span className="truncate w-2/3">{item.fileName}</span>
                  <span className={`text-xs uppercase font-bold ${
                    item.status === 'error' ? 'text-red-500' : 
                    item.status === 'completed' ? 'text-green-600' : 'text-blue-500'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      item.status === 'error' ? 'bg-red-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};