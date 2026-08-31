'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { staffApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toaster';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Users,
  Wrench,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Mail,
  Lock,
  User,
  Phone,
  Briefcase,
  Link2,
  Crown,
  BadgeCheck,
} from 'lucide-react';

const RoleBadge = ({ role, isSuperOfficer }) => {
  if (isSuperOfficer) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-800">
        <Crown className="h-3 w-3" /> Super Officer
      </span>
    );
  }
  if (role === 'officer') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
        <ShieldCheck className="h-3 w-3" /> Officer
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 border border-blue-300 px-2 py-0.5 text-[10px] font-bold text-blue-800">
      <Wrench className="h-3 w-3" /> Technician
    </span>
  );
};

export default function StaffManagementPage() {
  const router = useRouter();
  const { user, isOfficer, isSuperOfficer, loading: authLoading } = useAuth();

  const [staff, setStaff] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [removing, setRemoving] = useState(null);
  const [assigning, setAssigning] = useState(null);

  // Provision form state
  const [showProvisionForm, setShowProvisionForm] = useState(false);
  const [provisionRole, setProvisionRole] = useState('technician');
  const [provisionForm, setProvisionForm] = useState({
    name: '', email: '', password: '', designation: '', phone: '', assignedOfficerId: '',
  });
  const [provisioning, setProvisioning] = useState(false);
  const [provisionError, setProvisionError] = useState('');

  // Redirect if not officer
  useEffect(() => {
    if (!authLoading && (!isOfficer)) {
      router.replace('/login');
    }
  }, [authLoading, isOfficer, router]);

  const fetchStaff = useCallback(async () => {
    setFetching(true);
    try {
      const res = await staffApi.getAll();
      setStaff(res.data?.staff || []);

      if (isSuperOfficer) {
        const officersRes = await staffApi.getOfficers();
        setOfficers(officersRes.data?.officers || []);
      }
    } catch (err) {
      toast.error('Failed to load staff: ' + err.message);
    } finally {
      setFetching(false);
    }
  }, [isSuperOfficer]);

  useEffect(() => {
    if (!authLoading && isOfficer) {
      fetchStaff();
    }
  }, [authLoading, isOfficer, fetchStaff]);

  const handleProvision = async (e) => {
    e.preventDefault();
    setProvisionError('');
    if (!provisionForm.name || !provisionForm.email || !provisionForm.password) {
      setProvisionError('Name, email and password are required.');
      return;
    }
    setProvisioning(true);
    try {
      await staffApi.provision({
        ...provisionForm,
        role: provisionRole,
        assignedOfficerId: provisionForm.assignedOfficerId || undefined,
      });
      toast.success(`${provisionRole === 'officer' ? 'Officer' : 'Technician'} account created!`);
      setShowProvisionForm(false);
      setProvisionForm({ name: '', email: '', password: '', designation: '', phone: '', assignedOfficerId: '' });
      fetchStaff();
    } catch (err) {
      setProvisionError(err.message);
    } finally {
      setProvisioning(false);
    }
  };

  const handleRemove = async (staffId, name) => {
    if (!confirm(`Remove ${name} from the system? This cannot be undone.`)) return;
    setRemoving(staffId);
    try {
      await staffApi.remove(staffId);
      toast.success(`${name} has been removed.`);
      setStaff((prev) => prev.filter((s) => s._id !== staffId));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRemoving(null);
    }
  };

  const handleAssignOfficer = async (techId, officerId) => {
    setAssigning(techId);
    try {
      await staffApi.assignOfficer(techId, officerId || null);
      toast.success('Assignment updated.');
      fetchStaff();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAssigning(null);
    }
  };

  const officersList = staff.filter((s) => s.role === 'officer');
  const techniciansList = staff.filter((s) => s.role === 'technician');

  if (authLoading || fetching) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30]">
      <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Link href="/officer/dashboard">
              <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600 hover:text-[#0B1C30] rounded-xl">
                <ArrowLeft className="h-4 w-4" /> Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-black text-[#0B1C30]">Staff Management</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {isSuperOfficer ? 'Provision and manage all officers and field technicians.' : 'Technicians under your command.'}
              </p>
            </div>
          </div>
          {isSuperOfficer && (
            <Button
              onClick={() => setShowProvisionForm(!showProvisionForm)}
              className="gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-[0_4px_12px_rgba(5,150,105,0.25)]"
            >
              <UserPlus className="h-4 w-4" />
              Add Staff Member
            </Button>
          )}
        </div>

        {/* Provision Form (Super Officer only) */}
        {showProvisionForm && isSuperOfficer && (
          <div className="rounded-3xl border border-emerald-200 bg-white shadow-[0_8px_24px_rgba(5,150,105,0.08)] p-6 space-y-5">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center">
                <UserPlus className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-[#0B1C30]">Provision New Staff Account</h2>
            </div>

            {/* Role selector */}
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setProvisionRole('technician')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  provisionRole === 'technician'
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Wrench className="h-3.5 w-3.5" /> Technician
              </button>
              <button
                type="button"
                onClick={() => setProvisionRole('officer')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  provisionRole === 'officer'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Officer
              </button>
            </div>

            {provisionError && (
              <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {provisionError}
              </div>
            )}

            <form onSubmit={handleProvision} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input className="pl-9 h-9 text-xs" placeholder="e.g. Ali Hassan" value={provisionForm.name}
                    onChange={(e) => setProvisionForm((p) => ({ ...p, name: e.target.value }))} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input type="email" className="pl-9 h-9 text-xs" placeholder="staff@municipality.gov" value={provisionForm.email}
                    onChange={(e) => setProvisionForm((p) => ({ ...p, email: e.target.value }))} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input type="password" className="pl-9 h-9 text-xs" placeholder="Min 6 characters" value={provisionForm.password}
                    onChange={(e) => setProvisionForm((p) => ({ ...p, password: e.target.value }))} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input className="pl-9 h-9 text-xs" placeholder="+92 300 0000000" value={provisionForm.phone}
                    onChange={(e) => setProvisionForm((p) => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Designation</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input className="pl-9 h-9 text-xs" placeholder="e.g. Road Repair Crew Lead" value={provisionForm.designation}
                    onChange={(e) => setProvisionForm((p) => ({ ...p, designation: e.target.value }))} />
                </div>
              </div>
              {provisionRole === 'technician' && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Assign to Officer</Label>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <select
                      className="w-full pl-9 h-9 text-xs rounded-xl border border-slate-200 bg-[#F8F9FF] text-[#0B1C30] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={provisionForm.assignedOfficerId}
                      onChange={(e) => setProvisionForm((p) => ({ ...p, assignedOfficerId: e.target.value }))}
                    >
                      <option value="">— Unassigned —</option>
                      {officers.map((o) => (
                        <option key={o._id} value={o._id}>{o.name} {o.isSuperOfficer ? '(Super)' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              <div className="sm:col-span-2 flex gap-3 pt-2">
                <Button type="submit" disabled={provisioning} className="gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs h-9">
                  {provisioning ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                  {provisioning ? 'Creating...' : `Create ${provisionRole === 'officer' ? 'Officer' : 'Technician'}`}
                </Button>
                <Button type="button" variant="ghost" className="text-xs h-9 rounded-xl" onClick={() => { setShowProvisionForm(false); setProvisionError(''); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Officers section (Super Officer only) */}
        {isSuperOfficer && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h2 className="text-sm font-bold text-[#0B1C30] uppercase tracking-wider">Officers ({officersList.length})</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {officersList.map((member) => (
                <div key={member._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-200 flex items-center justify-center text-emerald-800 font-black text-sm">
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0B1C30]">{member.name}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{member.email}</div>
                      </div>
                    </div>
                    <RoleBadge role={member.role} isSuperOfficer={member.isSuperOfficer} />
                  </div>
                  {member.designation && <div className="text-[10px] text-slate-500 flex items-center gap-1"><Briefcase className="h-3 w-3" />{member.designation}</div>}
                  {member.phone && <div className="text-[10px] text-slate-500 flex items-center gap-1"><Phone className="h-3 w-3" />{member.phone}</div>}
                  <div className="text-[10px] text-slate-400">
                    Technicians: {techniciansList.filter((t) => t.assignedOfficer?._id === member._id || t.assignedOfficer === member._id).length}
                  </div>
                  {!member.isSuperOfficer && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full text-[11px] h-8 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-100 gap-1.5"
                      disabled={removing === member._id}
                      onClick={() => handleRemove(member._id, member.name)}
                    >
                      {removing === member._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              {officersList.length === 0 && (
                <div className="col-span-3 text-center py-8 text-xs text-slate-400">No officers yet. Provision one above.</div>
              )}
            </div>
          </div>
        )}

        {/* Technicians section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-blue-600" />
            <h2 className="text-sm font-bold text-[#0B1C30] uppercase tracking-wider">
              {isSuperOfficer ? `Field Technicians (${techniciansList.length})` : `Your Technicians (${staff.length})`}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(isSuperOfficer ? techniciansList : staff).map((member) => (
              <div key={member._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center text-blue-800 font-black text-sm">
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0B1C30]">{member.name}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{member.email}</div>
                    </div>
                  </div>
                  <RoleBadge role="technician" />
                </div>
                {member.designation && <div className="text-[10px] text-slate-500 flex items-center gap-1"><Briefcase className="h-3 w-3" />{member.designation}</div>}
                {member.phone && <div className="text-[10px] text-slate-500 flex items-center gap-1"><Phone className="h-3 w-3" />{member.phone}</div>}

                {/* Assign to officer (super officer only) */}
                {isSuperOfficer && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assigned Officer</label>
                    <select
                      className="w-full h-8 text-[11px] rounded-xl border border-slate-200 bg-slate-50 text-[#0B1C30] px-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={member.assignedOfficer?._id || member.assignedOfficer || ''}
                      disabled={assigning === member._id}
                      onChange={(e) => handleAssignOfficer(member._id, e.target.value)}
                    >
                      <option value="">— Unassigned —</option>
                      {officers.map((o) => (
                        <option key={o._id} value={o._id}>{o.name} {o.isSuperOfficer ? '(Super)' : ''}</option>
                      ))}
                    </select>
                    {assigning === member._id && <div className="text-[10px] text-emerald-600 flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Saving...</div>}
                  </div>
                )}

                {!isSuperOfficer && member.assignedOfficer && (
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <BadgeCheck className="h-3 w-3 text-emerald-500" />
                    Under: {member.assignedOfficer?.name || 'Officer'}
                  </div>
                )}

                {isSuperOfficer && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-[11px] h-8 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-100 gap-1.5"
                    disabled={removing === member._id}
                    onClick={() => handleRemove(member._id, member.name)}
                  >
                    {removing === member._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    Remove
                  </Button>
                )}
              </div>
            ))}
            {(isSuperOfficer ? techniciansList : staff).length === 0 && (
              <div className="col-span-3 rounded-2xl border border-dashed border-slate-300 py-10 text-center text-xs text-slate-400">
                <Users className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                {isSuperOfficer ? 'No technicians provisioned yet.' : 'No technicians assigned to you yet.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
