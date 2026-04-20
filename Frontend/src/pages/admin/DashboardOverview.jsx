import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserSquare2, 
  UserCircle, 
  Building2, 
  Briefcase, 
  FileText,
  RefreshCw 
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area
} from 'recharts';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden"
  >
    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 duration-500`} style={{ backgroundColor: color }} />
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg`} style={{ backgroundColor: `${color}15`, color }}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </motion.div>
);

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, analyticsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getAnalytics()
      ]);
      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // Format analytics data for charts
  const usersGrowthData = analytics?.userGrowth?.map(item => ({
    name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][item._id - 1],
    users: item.count
  })) || [];

  const jobsPostedData = analytics?.jobTrend?.map(item => ({
    name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][item._id - 1],
    jobs: item.count
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Platform analytics and summaries at a glance.</p>
        </div>
        <button 
          onClick={fetchData}
          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={stats?.totalUsers?.toLocaleString() || 0} icon={Users} color="#4F46E5" delay={0.1} />
        <StatCard title="Total Recruiters" value={stats?.totalRecruiters?.toLocaleString() || 0} icon={UserSquare2} color="#059669" delay={0.2} />
        <StatCard title="Total Candidates" value={stats?.totalCandidates?.toLocaleString() || 0} icon={UserCircle} color="#0ea5e9" delay={0.3} />
        <StatCard title="Total Companies" value={stats?.totalCompanies?.toLocaleString() || 0} icon={Building2} color="#db2777" delay={0.4} />
        <StatCard title="Jobs Posted" value={stats?.totalJobs?.toLocaleString() || 0} icon={Briefcase} color="#eab308" delay={0.5} />
        <StatCard title="Applications" value={stats?.totalApplications?.toLocaleString() || 0} icon={FileText} color="#8b5cf6" delay={0.6} />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Users Growth */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Users Growth</h3>
          <div className="h-72 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%" aspect={window.innerWidth < 640 ? 1.5 : 2.5}>
              <AreaChart data={usersGrowthData.length > 0 ? usersGrowthData : [{ name: 'N/A', users: 0 }]}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#4F46E5', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="users" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Jobs Posted Per Month */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Jobs Posted Per Month</h3>
          <div className="h-72 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%" aspect={window.innerWidth < 640 ? 1.5 : 2.5}>
              <BarChart data={jobsPostedData.length > 0 ? jobsPostedData : [{ name: 'N/A', jobs: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#eab308', fontWeight: 600 }}
                />
                <Bar dataKey="jobs" fill="#eab308" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardOverview;
