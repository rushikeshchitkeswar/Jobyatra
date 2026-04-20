import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, Sparkles } from 'lucide-react';
import AnalyticsCards from '../../components/dashboard/AnalyticsCards';
import DashboardCharts from '../../components/dashboard/DashboardCharts';
import ActivityTimeline from '../../components/dashboard/ActivityTimeline';
import SmartInsights from '../../components/dashboard/SmartInsights';
import UpcomingInterviews from '../../components/dashboard/UpcomingInterviews';
import ApplicationTracking from '../../components/dashboard/ApplicationTracking';
import { candidateService } from '../../services/candidateService';

export default function DashboardHome() {
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await candidateService.getProfile();
        if (response.success && response.data.userId) {
          setUserName(response.data.userId.name.split(' ')[0]);
        }
      } catch (error) {
        console.error('Error fetching name for dashboard:', error);
      }
    };
    fetchProfile();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6 md:space-y-8 px-4 sm:px-0">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight"
          >
            {greeting}{userName ? `, ${userName}` : ''}! 👋
          </motion.h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium">
            Here's what's happening with your job search today.
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate('/dashboard/analytics')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="hidden xs:inline">View Analytics</span>
            <span className="xs:hidden">Stats</span>
          </button>
          <button
            onClick={() => navigate('/jobs')}
            className="flex-1 sm:flex-none px-5 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
          >
            Browse Jobs
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Section 1: Overview KPI cards */}
      <AnalyticsCards />

      {/* Section 2: Active application tracker */}
      <ApplicationTracking />

      {/* Section 3: Charts (left wide) + Activity timeline (right narrow) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <DashboardCharts />
        </div>
        <div className="flex flex-col gap-6">
          <ActivityTimeline />
        </div>
      </div>

      {/* Section 4: Upcoming interviews + Smart insights (side by side on xl) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Upcoming Interviews compact */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-900">Upcoming Interviews</h3>
            <button
              onClick={() => navigate('/dashboard/interviews')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              View all →
            </button>
          </div>
          <UpcomingInterviews compact />
        </div>

        {/* Smart Insights */}
        <SmartInsights compact />
      </div>
    </div>
  );
}
