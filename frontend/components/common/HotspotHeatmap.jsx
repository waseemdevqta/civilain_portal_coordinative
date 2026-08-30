'use client';

import React, { useState, useEffect } from 'react';
import { complaintApi } from '../../lib/api';

export default function HotspotHeatmap() {
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');

  const fetchHotspots = async () => {
    setLoading(true);
    try {
      const res = await complaintApi.getHotspots();
      setHotspots(res.data || []);
    } catch (err) {
      setError('Failed to load neighborhood hotspots data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotspots();
  }, []);

  const filtered = hotspots.filter((item) => {
    if (filterRisk === 'all') return true;
    return item.riskLevel === filterRisk;
  });

  return (
    <div className="rounded-3xl bg-white border border-[#E2E8F0] p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E2E8F0]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#BA1A1A] animate-pulse"></span>
            <h3 className="text-base font-bold text-[#0B1C30]">Neighborhood Hotspot & Risk Explorer</h3>
          </div>
          <p className="text-xs text-[#526071] mt-0.5">
            Real-time municipal density clustering, hazard severity, and resolution rates
          </p>
        </div>

        {/* Risk Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F8F9FF] rounded-xl border border-[#E2E8F0]">
          {['all', 'critical', 'elevated', 'normal'].map((risk) => (
            <button
              key={risk}
              type="button"
              onClick={() => setFilterRisk(risk)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterRisk === risk
                  ? 'bg-white text-[#0B1C30] shadow-xs border border-[#CBD5E1]'
                  : 'text-[#526071] hover:text-[#0B1C30]'
              }`}
            >
              {risk}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="w-8 h-8 border-3 border-[#1F6C3A]/20 border-t-[#1F6C3A] rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-semibold text-[#526071]">Aggregating neighborhood metrics...</p>
        </div>
      ) : error ? (
        <div className="py-8 text-center text-xs text-[#BA1A1A]">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#526071]">No neighborhood clusters found in this filter.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-5">
          {filtered.map((item) => {
            const riskBadge =
              item.riskLevel === 'critical'
                ? { bg: 'bg-[#BA1A1A]/10 text-[#BA1A1A] border-[#BA1A1A]/20', label: 'Critical Cluster' }
                : item.riskLevel === 'elevated'
                ? { bg: 'bg-[#B45309]/10 text-[#B45309] border-[#B45309]/20', label: 'Elevated Watch' }
                : { bg: 'bg-[#1F6C3A]/10 text-[#1F6C3A] border-[#1F6C3A]/20', label: 'Stable' };

            return (
              <div
                key={item.area}
                className="p-5 rounded-2xl bg-[#F8F9FF] border border-[#E2E8F0] hover:border-[#CBD5E1] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-sm text-[#0B1C30]">{item.area}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskBadge.bg}`}>
                      {riskBadge.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="p-2 rounded-xl bg-white border border-[#E2E8F0]">
                      <span className="text-[10px] text-[#526071] block font-medium">Total</span>
                      <span className="text-sm font-bold text-[#0B1C30]">{item.total}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-[#E2E8F0]">
                      <span className="text-[10px] text-[#BA1A1A] block font-medium">Pending</span>
                      <span className="text-sm font-bold text-[#BA1A1A]">{item.pending}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-[#E2E8F0]">
                      <span className="text-[10px] text-[#1F6C3A] block font-medium">Fixed</span>
                      <span className="text-sm font-bold text-[#1F6C3A]">{item.resolved}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E2E8F0]/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[11px] font-medium text-[#526071]">Resolution Rate</span>
                    <span className="text-xs font-bold text-[#0B1C30]">{item.resolutionRate}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.resolutionRate >= 70
                          ? 'bg-[#1F6C3A]'
                          : item.resolutionRate >= 40
                          ? 'bg-[#B45309]'
                          : 'bg-[#BA1A1A]'
                      }`}
                      style={{ width: `${item.resolutionRate}%` }}
                    ></div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-[#526071]">
                    <span>Top: <strong className="text-[#0B1C30] capitalize">{item.topCategory}</strong></span>
                    <span>+{item.upvotes} Upvotes</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
