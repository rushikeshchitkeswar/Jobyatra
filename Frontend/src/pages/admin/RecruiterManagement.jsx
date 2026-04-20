import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ShieldOff,
  Building2,
  RefreshCw,
  RotateCcw,
  Briefcase
} from 'lucide-react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Pending: {
    label: 'Pending',
    badge: 'text-amber-700 bg-amber-50 border-amber-200',
    dot: 'bg-amber-500 animate-pulse',
    icon: Clock,
  },
  Approved: {
    label: 'Approved',
    badge: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle,
  },
  Rejected: {
    label: 'Rejected',
    badge: 'text-red-700 bg-red-50 border-red-200',
    dot: 'bg-red-500',
    icon: XCircle,
  },
  Suspended: {
    label: 'Suspended',
    badge: 'text-orange-700 bg-orange-50 border-orange-200',
    dot: 'bg-orange-500',
    icon: ShieldOff,
  },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.badge}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
};

// ── Action button component ───────────────────────────────────────────────────
const ActionBtn = ({ onClick, title, icon: Icon, colorClass, disabled }) => (
  <button
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`p-2 rounded-lg transition-colors border border-transparent ${colorClass} disabled:opacity-40 disabled:cursor-not-allowed`}
  >
    <Icon className="w-4 h-4" />
  </button>
);

// ─────────────────────────────────────────────────────────────────────────────

const RecruiterManagement = () => {
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // tracks which row is processing
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, suspended: 0 });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({
        role: 'recruiter',
        search: searchTerm || undefined,
      });

      const all = res.data || [];

      // Derive recruiterStatus from fields if missing (for legacy docs)
      const normalized = all.map(r => ({
        ...r,
        recruiterStatus: r.recruiterStatus ||
          (r.isBlocked ? 'Suspended' : r.recruiterVerified ? 'Approved' : 'Pending'),
      }));

      // Client-side filter by status tab
      const filtered = statusFilter === 'all'
        ? normalized
        : normalized.filter(r => r.recruiterStatus === statusFilter);

      setRecruiters(filtered);

      // Update stats from the full unfiltered list
      setStats({
        total:     normalized.length,
        pending:   normalized.filter(r => r.recruiterStatus === 'Pending').length,
        approved:  normalized.filter(r => r.recruiterStatus === 'Approved').length,
        rejected:  normalized.filter(r => r.recruiterStatus === 'Rejected').length,
        suspended: normalized.filter(r => r.recruiterStatus === 'Suspended').length,
      });
    } catch (error) {
      toast.error('Failed to fetch recruiters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(fetchData, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleStatusChange = async (recruiterId, newStatus) => {
    setActionLoading(recruiterId + newStatus);
    try {
      await adminService.updateRecruiterStatus(recruiterId, newStatus);
      const messages = {
        Approved:  '✅ Recruiter approved — they can now log in.',
        Rejected:  '❌ Recruiter application rejected.',
        Suspended: '🔒 Recruiter account suspended.',
        Pending:   '🔄 Recruiter status reset to pending.',
      };
      toast.success(messages[newStatus] || 'Status updated');
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update recruiter status');
    } finally {
      setActionLoading(null);
    }
  };

  const FILTER_TABS = [
    { key: 'all',      label: 'All' },
    { key: 'Pending',  label: 'Pending' },
    { key: 'Approved', label: 'Approved' },
    { key: 'Rejected', label: 'Rejected' },
    { key: 'Suspended',label: 'Suspended' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruiter Management</h1>
          <p className="text-gray-500 mt-1">Review applications and manage recruiter account access.</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Approval', value: stats.pending,   color: 'amber',   icon: Clock },
          { label: 'Approved',         value: stats.approved,  color: 'emerald', icon: CheckCircle },
          { label: 'Rejected',         value: stats.rejected,  color: 'red',     icon: XCircle },
          { label: 'Suspended',        value: stats.suspended, color: 'orange',  icon: ShieldOff },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full bg-${color}-50 flex items-center justify-center text-${color}-600 flex-shrink-0`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium leading-tight">{label}</p>
              <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex gap-1 flex-wrap">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === tab.key
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table container with improved scrolling */}
        <div className="overflow-x-auto custom-scrollbar">
          <div className="inline-block min-w-full align-middle">
            {loading && recruiters.length === 0 ? (
              <div className="flex items-center justify-center p-20">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 font-bold uppercase text-[10px] tracking-wider text-gray-500">
                    <th className="px-6 py-4 text-left whitespace-nowrap">Recruiter</th>
                    <th className="px-6 py-4 text-left whitespace-nowrap">Company</th>
                    <th className="px-6 py-4 text-left whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 text-left whitespace-nowrap">Joined</th>
                    <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                {recruiters.map((recruiter, idx) => {
                  const status = recruiter.recruiterStatus || 'Pending';
                  const isProcessing = actionLoading && actionLoading.startsWith(recruiter._id);

                  return (
                    <motion.tr
                      key={recruiter._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.04 }}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      {/* Recruiter info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm uppercase flex-shrink-0">
                            {recruiter.name?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{recruiter.name}</div>
                            <div className="text-xs text-gray-500">{recruiter.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Company & Job count insights */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          {/* Primary registered company */}
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded bg-indigo-50 flex items-center justify-center font-bold text-indigo-500 text-xs uppercase flex-shrink-0">
                              {(recruiter.companyName || recruiter.name || '?').charAt(0)}
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              {recruiter.companyName || <span className="text-gray-400 font-normal italic">Not set</span>}
                            </span>
                          </div>

                          {/* Posting analytics */}
                          <div className="mt-2 flex flex-col gap-1.5">
                            <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600/80 bg-indigo-50/20 w-fit px-1.5 py-0.5 rounded border border-indigo-100/50">
                              <Briefcase className="w-3 h-3" />
                              {recruiter.jobCount || 0} Jobs Posted
                            </div>
                            
                            {recruiter.postedCompanies && recruiter.postedCompanies.length > 0 && (
                              <div className="text-[10px] text-gray-500 max-w-[200px]">
                                <span className="font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">{recruiter.postedCompanies.length > 1 ? 'Companies Managed:' : 'Posted for:'}</span>
                                <div className="flex flex-wrap gap-1">
                                  {recruiter.postedCompanies.map((c, i) => (
                                    <span key={i} className="bg-gray-50 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                                      {c}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="px-6 py-4">
                        <StatusBadge status={status} />
                      </td>

                      {/* Joined date */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(recruiter.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end items-center gap-1">
                          {/* Approve — show when not already Approved */}
                          {status !== 'Approved' && (
                            <ActionBtn
                              icon={CheckCircle}
                              title="Approve"
                              disabled={isProcessing}
                              onClick={() => handleStatusChange(recruiter._id, 'Approved')}
                              colorClass="text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200"
                            />
                          )}

                          {/* Reject — show when Pending or Approved */}
                          {(status === 'Pending' || status === 'Approved') && (
                            <ActionBtn
                              icon={XCircle}
                              title="Reject"
                              disabled={isProcessing}
                              onClick={() => handleStatusChange(recruiter._id, 'Rejected')}
                              colorClass="text-red-600 hover:bg-red-50 hover:border-red-200"
                            />
                          )}

                          {/* Suspend — show when Approved */}
                          {status === 'Approved' && (
                            <ActionBtn
                              icon={ShieldOff}
                              title="Suspend"
                              disabled={isProcessing}
                              onClick={() => handleStatusChange(recruiter._id, 'Suspended')}
                              colorClass="text-orange-600 hover:bg-orange-50 hover:border-orange-200"
                            />
                          )}

                          {/* Reset to Pending — show when Rejected or Suspended */}
                          {(status === 'Rejected' || status === 'Suspended') && (
                            <ActionBtn
                              icon={RotateCcw}
                              title="Reset to Pending"
                              disabled={isProcessing}
                              onClick={() => handleStatusChange(recruiter._id, 'Pending')}
                              colorClass="text-gray-500 hover:bg-gray-100 hover:border-gray-300"
                            />
                          )}

                          {/* Spinner overlay when processing this row */}
                          {isProcessing && (
                            <RefreshCw className="w-4 h-4 text-indigo-500 animate-spin ml-1" />
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}

                {recruiters.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <Building2 className="w-10 h-10 opacity-40" />
                        <p className="text-sm font-medium">No recruiters found</p>
                        {statusFilter !== 'all' && (
                          <button
                            onClick={() => setStatusFilter('all')}
                            className="text-xs text-indigo-600 hover:underline"
                          >
                            Clear filter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="font-semibold text-gray-600">Actions Guide:</span>
        <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Approve — grants dashboard access</span>
        <span className="flex items-center gap-1"><XCircle className="w-3.5 h-3.5 text-red-600" /> Reject — blocks login with rejection message</span>
        <span className="flex items-center gap-1"><ShieldOff className="w-3.5 h-3.5 text-orange-600" /> Suspend — immediately revokes access</span>
        <span className="flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5 text-gray-500" /> Reset — moves back to pending review</span>
      </div>
    </div>
  );
};

export default RecruiterManagement;
