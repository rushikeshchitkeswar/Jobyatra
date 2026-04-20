import React from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Users, 
  CalendarCheck, 
  UserCheck,
  TrendingUp,
  TrendingDown,
  ArrowUpRight
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
const COLORS = ['#94a3b8', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];

export default function RecruiterDashboard() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 640);
  const [isMediumScreen, setIsMediumScreen] = useState(window.innerWidth < 1024);
  
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 640);
      setIsMediumScreen(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiService.getDashboardStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);
  
  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110`} />
      
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
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

  return (
    <div className="space-y-6 pb-10">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          title="Active Job Posts" 
          value={isLoading ? '...' : stats?.activeJobs || 0} 
          icon={Briefcase} 
          trend="up" 
          trendValue="+12%" 
          color="blue" 
        />
        <StatCard 
          title="Total Applicants" 
          value={isLoading ? '...' : (stats?.totalApplicants || 0).toLocaleString()} 
          icon={Users} 
          trend="up" 
          trendValue="+18%" 
          color="indigo" 
        />
        <StatCard 
          title="Interviews Scheduled" 
          value={isLoading ? '...' : stats?.interviewsCount || 0} 
          icon={CalendarCheck} 
          trend="up" 
          trendValue="+4%" 
          color="amber" 
        />
        <StatCard 
          title="Candidates Hired" 
          value={isLoading ? '...' : stats?.totalHires || 0} 
          icon={UserCheck} 
          trend="up" 
          trendValue="+25%" 
          color="emerald" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Line Chart: Applications Over Time */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
             <div>
                <h3 className="text-lg font-bold text-slate-800">Applications Overview</h3>
                <p className="text-sm text-slate-500">Number of applications received this week</p>
             </div>
             <button className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
               View Details
             </button>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.applicationsTrend || []} margin={{ top: 5, right: isSmallScreen ? 10 : 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10 }} 
                  dy={10} 
                  interval={isSmallScreen ? 1 : 0} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6, fill: '#2563eb', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Pipeline */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Hiring Pipeline</h3>
          <p className="text-sm text-slate-500 mb-6">Current candidate distribution</p>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.pipelineDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(stats?.pipelineDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   itemStyle={{ color: '#1e293b', fontWeight: 500 }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-slate-800">{stats?.totalApplicants || 0}</span>
              <span className="text-xs text-slate-500">Total</span>
            </div>
          </div>
          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {(stats?.pipelineDistribution || []).map((entry, index) => (
              <div key={entry.name} className="flex items-center text-xs">
                <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="text-slate-600 truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bar Chart and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Bar Chart: Apps per Job */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
             <h3 className="text-lg font-bold text-slate-800 mb-6">Applications Per Job</h3>
             <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={stats?.applicationsByJob || []} 
                    layout={isSmallScreen ? "vertical" : "horizontal"} 
                    margin={{ top: 5, right: isSmallScreen ? 20 : 0, bottom: 5, left: isSmallScreen ? 20 : -20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={!isSmallScreen} horizontal={isSmallScreen} stroke="#e2e8f0" />
                    {isSmallScreen ? (
                      <>
                        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                        <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} width={80} />
                      </>
                    ) : (
                      <>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      </>
                    )}
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="applicants" fill="#6366f1" radius={isSmallScreen ? [0, 4, 4, 0] : [4, 4, 0, 0]} barSize={isSmallScreen ? 20 : 40} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Recent Activity / Actions Widget */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800">Quick Actions</h3>
             </div>
             
             <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 flex-1">
                <motion.button whileHover={{ scale: 1.02 }} className="flex flex-col items-center justify-center p-6 bg-blue-50/50 hover:bg-blue-100/50 border border-blue-100 rounded-xl transition-colors group">
                   <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:shadow-md transition-all">
                      <Briefcase className="w-6 h-6 text-blue-600" />
                   </div>
                   <span className="font-semibold text-slate-800">Post New Job</span>
                   <span className="text-xs text-slate-500 mt-1">Reach more candidates</span>
                </motion.button>
                
                <motion.button whileHover={{ scale: 1.02 }} className="flex flex-col items-center justify-center p-6 bg-indigo-50/50 hover:bg-indigo-100/50 border border-indigo-100 rounded-xl transition-colors group">
                   <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:shadow-md transition-all">
                      <Users className="w-6 h-6 text-indigo-600" />
                   </div>
                   <span className="font-semibold text-slate-800">Review Applicants</span>
                   <span className="text-xs text-slate-500 mt-1">12 new since yesterday</span>
                </motion.button>

                <motion.button whileHover={{ scale: 1.02 }} className="flex flex-col items-center justify-center p-6 bg-amber-50/50 hover:bg-amber-100/50 border border-amber-100 rounded-xl transition-colors group relative overflow-hidden">
                   <div className="absolute top-2 right-2 flex space-x-1">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                   </div>
                   <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:shadow-md transition-all">
                      <CalendarCheck className="w-6 h-6 text-amber-600" />
                   </div>
                   <span className="font-semibold text-slate-800">Interviews</span>
                   <span className="text-xs text-slate-500 mt-1">3 scheduled today</span>
                </motion.button>

                <motion.button whileHover={{ scale: 1.02 }} className="flex flex-col items-center justify-center p-6 bg-emerald-50/50 hover:bg-emerald-100/50 border border-emerald-100 rounded-xl transition-colors group">
                   <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:shadow-md transition-all">
                      <ArrowUpRight className="w-6 h-6 text-emerald-600" />
                   </div>
                   <span className="font-semibold text-slate-800">Promote Job</span>
                   <span className="text-xs text-slate-500 mt-1">Boost visibility</span>
                </motion.button>
             </div>
          </div>
      </div>
    </div>
  );
}
