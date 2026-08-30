'use client';

import React, { useEffect } from 'react';

export default function ImageLightbox({
  isOpen,
  onClose,
  imageUrl,
  title = 'Visual Evidence',
  subtitle = '',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1C30]/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#E2E8F0] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F8F9FF]">
          <div>
            <h3 className="text-base font-bold text-[#0B1C30] flex items-center gap-2">
              <svg className="w-5 h-5 text-[#1F6C3A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {title}
            </h3>
            {subtitle && <p className="text-xs text-[#526071] mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-white border border-[#E2E8F0] text-[#526071] hover:text-[#0B1C30] hover:bg-[#F1F5F9] transition-colors"
              title="Open full image in new tab"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white border border-[#E2E8F0] text-[#526071] hover:text-[#BA1A1A] hover:bg-[#F1F5F9] transition-colors"
              title="Close modal"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="p-4 bg-[#0F172A] flex items-center justify-center min-h-[300px] max-h-[75vh] overflow-auto">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[70vh] w-auto object-contain rounded-xl shadow-lg"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#F8F9FF] border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#526071]">
          <span>Verified Cloudinary Media Stream</span>
          <button
            type="button"
            onClick={onClose}
            className="font-semibold text-[#0B1C30] hover:underline"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
