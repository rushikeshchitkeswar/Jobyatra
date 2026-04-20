import React from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Users,
  CalendarCheck,
  UserCheck,
  TrendingUp,
  TrendingDown,
  ClipboardList,
  Clock,
  CheckCircle2,
  Target
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Using dynamic data from backend
const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await apiService.getRecruiterAnalytics();
        if (response.success) {
          // console.log("DEBUG: Analytics Data Received:", response.data);
          setAnalyticsData(response.data);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, bgClass, textClass, hoverBgClass }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
      className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 ${bgClass} opacity-40 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-125`} />

      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${bgClass} ${textClass} ${hoverBgClass} transition-colors`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <div className="mt-4 flex items-center text-sm">
        <span className={`flex items-center font-medium ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
          {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
          {trendValue}
        </span>
        <span className="text-slate-400 ml-2">vs last month</span>
      </div>
    </motion.div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-lg">
          <p className="text-sm font-semibold text-slate-800 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-medium text-slate-600">
              {entry.name || 'Value'}: <span className="font-bold text-slate-900">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-10">

      {/* 1. Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Active Job Posts"
          value={analyticsData?.stats?.activeJobs || 0}
          icon={Briefcase}
          trend="up"
          trendValue="+0%"
          bgClass="bg-blue-50"
          textClass="text-blue-600"
          hoverBgClass="group-hover:bg-blue-100"
        />
        <StatCard
          title="Total Applications"
          value={analyticsData?.stats?.totalApplicants || 0}
          icon={Users}
          trend="up"
          trendValue="+0%"
          bgClass="bg-indigo-50"
          textClass="text-indigo-600"
          hoverBgClass="group-hover:bg-indigo-100"
        />
        <StatCard
          title="Shortlisted"
          value={analyticsData?.stats?.shortlistedCount || 0}
          icon={ClipboardList}
          trend="up"
          trendValue="+0%"
          bgClass="bg-purple-50"
          textClass="text-purple-600"
          hoverBgClass="group-hover:bg-purple-100"
        />
        <StatCard
          title="Interviews"
          value={analyticsData?.stats?.interviewsCount || 0}
          icon={CalendarCheck}
          trend="up"
          trendValue="+0%"
          bgClass="bg-amber-50"
          textClass="text-amber-600"
          hoverBgClass="group-hover:bg-amber-100"
        />
        <StatCard
          title="Hired Candidates"
          value={analyticsData?.stats?.totalHires || 0}
          icon={UserCheck}
          trend="up"
          trendValue="+0%"
          bgClass="bg-emerald-50"
          textClass="text-emerald-600"
          hoverBgClass="group-hover:bg-emerald-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 3. Applications Trend Over Time (Line Chart) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800">Applications Trend Over Time</h3>
            <p className="text-sm text-slate-500">Monthly application volume</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData?.monthlyTrend || []} margin={{ top: 5, right: isSmallScreen ? 10 : 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  dy={10}
                  interval={isSmallScreen ? 1 : 0}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }} />
                <Line
                  type="monotone"
                  dataKey="apps"
                  name="Applications"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#2563eb', strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 2. Applications Per Job (Bar Chart) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800">Applications Per Job</h3>
            <p className="text-sm text-slate-500">Highest volume job posts</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData?.applicationsByJob || []} layout="vertical" margin={{ top: 0, right: isSmallScreen ? 20 : 20, bottom: 0, left: isSmallScreen ? 10 : 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} width={isSmallScreen ? 70 : 80} />
                <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                <Bar dataKey="count" name="Applicants" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={isSmallScreen ? 15 : 20} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* 4. Hiring Pipeline Distribution (Pie Chart) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-slate-800">Hiring Pipeline</h3>
            <p className="text-sm text-slate-500">Candidate current stages</p>
          </div>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData?.pipelineDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {(analyticsData?.pipelineDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-slate-800">{analyticsData?.stats?.totalApplicants || 0}</span>
              <span className="text-xs text-slate-500">Total</span>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(analyticsData?.pipelineDistribution || []).map((entry, index) => (
              <div key={entry.name} className="flex items-center text-xs">
                <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="text-slate-600 truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>



      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 6. Job Performance Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex-shrink-0">
            <h3 className="text-lg font-bold text-slate-800">Job Performance</h3>
            <p className="text-sm text-slate-500">Conversion rates for active postings</p>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Job Title</th>
                  <th className="px-6 py-4 font-medium">Views</th>
                  <th className="px-6 py-4 font-medium">Applications</th>
                  <th className="px-6 py-4 font-medium">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(analyticsData?.jobPerformance || []).map((job, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{job.title}</td>
                    <td className="px-6 py-4">{job.views}</td>
                    <td className="px-6 py-4 text-indigo-600 font-medium">{job.applications}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {job.conversion}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Stack: 5. Top Skills & 8. Hiring Speed Metrics */}
        <div className="space-y-6">

          {/* 5. Top Skills in Applicants */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-800">Top Applicant Skills</h3>
            </div>
            <div className="space-y-4">
              {(analyticsData?.skillsData || []).map((skill, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700">{skill.name}</span>
                    <span className="text-slate-500">{skill.count} applicants</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <motion.div
                      className="bg-indigo-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(skill.count / 10) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>


        </div>
      </div>

    </div>
  );
}
