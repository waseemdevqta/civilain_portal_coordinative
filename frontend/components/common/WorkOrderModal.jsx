'use client';

import React from 'react';

export default function WorkOrderModal({
  isOpen,
  onClose,
  complaint,
}) {
  if (!isOpen || !complaint) return null;

  const ticketId = `CF-${complaint._id?.slice(-6).toUpperCase() || '000000'}`;
  const printDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1C30]/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#CBD5E1] my-8 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-[#F8F9FF] print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1F6C3A]"></span>
            <h3 className="text-sm font-bold text-[#0B1C30]">Official Municipal Docket Preview</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Docket (Ctrl+P)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white border border-[#E2E8F0] text-[#526071] hover:text-[#BA1A1A] hover:bg-[#F1F5F9] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Printable Docket Paper */}
        <div className="p-8 bg-white text-[#0B1C30] print:p-0">
          {/* Header Banner */}
          <div className="border-b-2 border-[#0B1C30] pb-6 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-[#0B1C30]">AWAZ</span>
                <span className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#1F6C3A]/10 text-[#1F6C3A] border border-[#1F6C3A]/20">
                  Municipal Dispatch
                </span>
              </div>
              <p className="text-xs text-[#526071] mt-1 font-medium">
                Civilian Infrastructure & Public Works Department
              </p>
              <p className="text-[11px] text-[#94A3B8]">
                Docket Auth Code: CF-DOCK-{complaint._id?.slice(-8).toUpperCase()}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold uppercase text-[#526071]">Ticket Reference</span>
              <p className="text-xl font-mono font-black text-[#0B1C30]">{ticketId}</p>
              <span className="inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1]">
                STATUS: {complaint.status?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Core Info Grid */}
          <div className="grid grid-cols-2 gap-4 py-6 border-b border-[#E2E8F0] text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-[#526071]">Sector / Category</span>
              <p className="font-semibold text-sm capitalize text-[#0B1C30] mt-0.5">{complaint.category}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-[#526071]">Target Area / Zone</span>
              <p className="font-semibold text-sm text-[#0B1C30] mt-0.5">{complaint.area}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-[#526071]">Priority Assessment</span>
              <p className="font-semibold text-sm capitalize text-[#0B1C30] mt-0.5">
                {complaint.priority || 'Standard'} ({complaint.priorityScore || 0} pts)
              </p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-[#526071]">Citizen Upvotes</span>
              <p className="font-semibold text-sm text-[#0B1C30] mt-0.5">+{complaint.upvotes || 0} Citizens</p>
            </div>
          </div>

          {/* Issue Statement */}
          <div className="py-6 border-b border-[#E2E8F0]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#526071]">Incident Title</span>
            <h4 className="text-base font-bold text-[#0B1C30] mt-1">{complaint.title}</h4>
            <div className="mt-3 p-4 rounded-xl bg-[#F8F9FF] border border-[#E2E8F0]">
              <span className="text-[10px] font-bold uppercase text-[#526071] block mb-1">Citizen Narrative</span>
              <p className="text-xs text-[#334155] leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
            </div>
          </div>

          {/* Photo Evidence Verification */}
          {(complaint.imageUrl || complaint.resolutionImageUrl) && (
            <div className="py-6 border-b border-[#E2E8F0]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#526071] block mb-3">
                Visual Evidence Attachments
              </span>
              <div className="grid grid-cols-2 gap-4">
                {complaint.imageUrl && (
                  <div>
                    <span className="text-[11px] font-semibold text-[#526071] block mb-1">Citizen Report Photo</span>
                    <img
                      src={complaint.imageUrl}
                      alt="Citizen Evidence"
                      className="w-full h-36 object-cover rounded-xl border border-[#CBD5E1]"
                    />
                  </div>
                )}
                {complaint.resolutionImageUrl && (
                  <div>
                    <span className="text-[11px] font-semibold text-[#1F6C3A] block mb-1">Officer Resolution Photo</span>
                    <img
                      src={complaint.resolutionImageUrl}
                      alt="Resolution Proof"
                      className="w-full h-36 object-cover rounded-xl border border-[#CBD5E1]"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Officer Remarks */}
          {complaint.officerRemark && (
            <div className="py-4 border-b border-[#E2E8F0]">
              <span className="text-[10px] font-bold uppercase text-[#526071] block mb-1">Official Field Remarks</span>
              <p className="text-xs font-semibold text-[#0B1C30] italic">"{complaint.officerRemark}"</p>
            </div>
          )}

          {/* Sign-off & Barcode Simulation */}
          <div className="pt-6 grid grid-cols-2 gap-6 items-end text-xs">
            <div>
              <div className="h-10 border-b border-dashed border-[#94A3B8]"></div>
              <p className="text-[10px] font-bold uppercase text-[#526071] mt-1">Field Officer Signature & Seal</p>
            </div>
            <div className="text-right">
              <div className="font-mono text-[10px] text-[#526071] mb-1">||| | |||| | ||||| ||| |||| |</div>
              <p className="text-[10px] text-[#94A3B8]">Printed on: {printDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
