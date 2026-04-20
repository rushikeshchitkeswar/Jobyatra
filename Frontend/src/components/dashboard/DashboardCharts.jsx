import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, Area, AreaChart
} from 'recharts';
import { candidateService } from '../../services/candidateService';
import { Loader2, TrendingUp, Target, BarChart2 } from 'lucide-react';

const STATUS_COLORS = {
  Applied:    '#3b82f6',
  Screening:  '#f59e0b',
  Shortlisted:'#8b5cf6',
  Interview:  '#06b6d4',
  Offer:      '#10b981',
  Hired:      '#059669',
  Rejected:   '#ef4444',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 shadow-lg rounded-xl px-4 py-3 text-sm">
        <p className="font-bold text-slate-700 mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.dataKey} style={{ color: p.color || '#3b82f6' }} className="font-semibold">
            {p.name || p.dataKey}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardCharts() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [monthRange, setMonthRange] = useState(6);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await candidateService.getAnalytics();
        if (res.success) setAnalytics(res.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[1, 2].map(i => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
            <div className="h-5 bg-slate-100 rounded w-1/3 mb-4" />
            <div className="h-[280px] bg-slate-50 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  const monthlyData = analytics?.applicationsPerMonth?.slice(-monthRange) || [];
  const statusData  = (analytics?.statusData || []).filter(d => d.value > 0);
  const typeData    = analytics?.typeDistribution || [];

  const KpiCard = ({ label, value, color, icon: Icon, suffix = '' }) => (
    <div className={`bg-${color}-50 border border-${color}-100 rounded-xl p-4 flex items-center gap-3`}>
      <div className={`w-9 h-9 bg-${color}-100 rounded-xl flex items-center justify-center`}>
        <Icon className={`w-5 h-5 text-${color}-600`} />
      </div>
      <div>
        <p className={`text-2xl font-black text-${color}-700`}>{value}{suffix}</p>
        <p className={`text-xs font-semibold text-${color}-500`}>{label}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 mb-8">
      {/* KPI row */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-blue-700">{analytics?.totalApplications ?? 0}</p>
            <p className="text-xs font-semibold text-blue-500">Total Applied</p>
          </div>
        </div>
        <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-cyan-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-cyan-700">{analytics?.interviewRate ?? 0}%</p>
            <p className="text-xs font-semibold text-cyan-500">Interview Rate</p>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-700">{analytics?.responseRate ?? 0}%</p>
            <p className="text-xs font-semibold text-emerald-500">Response Rate</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Per Month */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900">Applications Per Month</h3>
            <select
              value={monthRange}
              onChange={e => setMonthRange(Number(e.target.value))}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-600 font-semibold py-1.5 px-3 cursor-pointer outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value={3}>Last 3 months</option>
              <option value={6}>Last 6 months</option>
              <option value={12}>Last 12 months</option>
            </select>
          </div>
          {monthlyData.length === 0 || monthlyData.every(d => d.apps === 0) ? (
            <div className="h-[240px] flex items-center justify-center text-slate-400 text-sm">
              No application data yet
            </div>
          ) : (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="apps" stroke="#3b82f6" strokeWidth={2.5} fill="url(#blueGrad)" name="Applications" dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Application Status Donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col"
        >
          <h3 className="text-base font-bold text-slate-900 mb-4">Application Status</h3>
          {statusData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
              No applications yet
            </div>
          ) : (
            <>
              <div className="flex-1 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none">
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                {statusData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[d.name] || '#94a3b8' }} />
                    <span className="text-xs text-slate-600 font-medium truncate">{d.name}</span>
                    <span className="text-xs font-bold text-slate-900 ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Job Type Distribution */}
      {typeData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
        >
          <h3 className="text-base font-bold text-slate-900 mb-5">Job Type Distribution</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={20} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
}
