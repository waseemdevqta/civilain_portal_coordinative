'use client';

import React, { useState, useRef } from 'react';
import { uploadApi } from '../../lib/api';

export default function ImageUploader({
  value = '',
  onChange,
  type = 'evidence',
  label = 'Attach Photo Evidence (Optional)',
  description = 'Upload clear photo proof (PNG, JPG, WebP up to 5MB)',
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const response = await uploadApi.uploadImage(file, type);
      if (response?.data?.url) {
        onChange(response.data.url, response.data.publicId || '');
      } else {
        setError('Upload succeeded but no image URL was returned.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError('');
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-[#0B1C30]">{label}</label>
          {value && (
            <span className="text-xs font-semibold text-[#1F6C3A] flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Photo Attached
            </span>
          )}
        </div>
      )}

      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-[#E2E8F0] bg-[#F8F9FF] p-2 flex items-center gap-4">
          <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-[#E2E8F0] flex-shrink-0 border border-[#CBD5E1]">
            <img
              src={value}
              alt="Uploaded Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 pr-10">
            <p className="text-sm font-semibold text-[#0B1C30] truncate">Photo Attached</p>
            <p className="text-xs text-[#526071] mt-0.5 break-all line-clamp-2">{value}</p>
            <div className="mt-2 flex items-center gap-2">
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-[#1F6C3A] hover:underline"
              >
                View full photo ↗
              </a>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white border border-[#E2E8F0] text-[#526071] hover:text-[#BA1A1A] hover:border-[#BA1A1A]/30 transition-colors shadow-xs"
            title="Remove photo"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
            dragOver
              ? 'border-[#1F6C3A] bg-[#1F6C3A]/5 scale-[0.99]'
              : 'border-[#CBD5E1] bg-[#F8F9FF] hover:bg-[#F1F5F9] hover:border-[#94A3B8]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
          />

          {uploading ? (
            <div className="flex flex-col items-center justify-center py-2">
              <div className="w-8 h-8 border-3 border-[#1F6C3A]/20 border-t-[#1F6C3A] rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-semibold text-[#0B1C30]">Uploading & Optimizing...</p>
              <p className="text-xs text-[#526071] mt-1">Processing image via Cloudinary CDN</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#526071] shadow-xs mb-3 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6 text-[#1F6C3A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-[#0B1C30]">
                Click to upload <span className="text-[#526071] font-normal">or drag & drop</span>
              </p>
              <p className="text-xs text-[#526071] mt-1">{description}</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs font-semibold text-[#BA1A1A] flex items-center gap-1.5 mt-1.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
