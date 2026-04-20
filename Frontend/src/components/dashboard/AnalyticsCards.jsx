import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase, Bookmark, PhoneCall, Eye, TrendingUp,
  CheckCircle2, XCircle, FileDown, Loader2
} from 'lucide-react';
import { candidateService } from '../../services/candidateService';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const CARD_CONFIG = [
  { key: 'Applied Jobs',       icon: Briefcase,     gradient: 'from-blue-500 to-blue-600',    bg: 'bg-blue-50',    text: 'text-blue-600'    },
  { key: 'Interviews',         icon: PhoneCall,     gradient: 'from-cyan-500 to-cyan-600',    bg: 'bg-cyan-50',    text: 'text-cyan-600'    },
  { key: 'Shortlisted',        icon: TrendingUp,    gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50',  text: 'text-purple-600'  },
  { key: 'Rejected',           icon: XCircle,       gradient: 'from-rose-500 to-rose-600',    bg: 'bg-rose-50',    text: 'text-rose-600'    },
  { key: 'Saved Jobs',         icon: Bookmark,      gradient: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50',  text: 'text-indigo-600'  },
  { key: 'Profile Completion', icon: CheckCircle2,  gradient: 'from-emerald-500 to-emerald-600',bg:'bg-emerald-50', text: 'text-emerald-600' },
];

export default function AnalyticsCards() {
  const [stats,    setStats]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, profileRes] = await Promise.all([
          candidateService.getDashboardStats(),
          candidateService.getProfile()
        ]);

        const completionPct = statsRes?.data?.completionPercentage
          ?? profileRes?.data?.completionPercentage ?? 0;
        setCompletion(completionPct);

        const rawStats = statsRes?.data?.stats || [];

        // Build a unified stats map from API
        const statMap = {};
        rawStats.forEach(s => { statMap[s.name] = s; });

        // Compute interview / shortlisted / rejected from analytics
        const analyticsRes = await candidateService.getAnalytics().catch(() => null);
        const analyticsData = analyticsRes?.data || {};

        const statusMap = {};
        (analyticsData.statusData || []).forEach(s => { statusMap[s.name] = s.value; });

        const buildStat = (key, value, trend, trendColor) => ({
          name: key, value: String(value ?? '0'), trend, trendColor
        });

        const finalStats = [
          // Applied Jobs from existing
          buildStat(
            'Applied Jobs',
            statMap['Applied Jobs']?.value ?? analyticsData.totalApplications ?? 0,
            statMap['Applied Jobs']?.trend ?? 'Total applications',
            'text-blue-600'
          ),
          buildStat(
            'Interviews',
            statusMap['Interview'] ?? analyticsData.totalInterviews ?? 0,
            `${analyticsData.interviewRate ?? 0}% conversion rate`,
            'text-cyan-600'
          ),
          buildStat(
            'Shortlisted',
            statusMap['Shortlisted'] ?? 0,
            'In recruiter review',
            'text-purple-600'
          ),
          buildStat(
            'Rejected',
            statusMap['Rejected'] ?? 0,
            'Don\'t give up!',
            'text-rose-500'
          ),
          buildStat(
            'Saved Jobs',
            statMap['Saved Jobs']?.value ?? 0,
            'For later review',
            'text-indigo-600'
          ),
          buildStat(
            'Profile Completion',
            `${completionPct}%`,
            completionPct >= 80 ? 'Great profile!' : 'Needs more info',
            completionPct >= 80 ? 'text-emerald-600' : 'text-amber-500'
          ),
        ];

        setStats(finalStats);
      } catch (error) {
        console.error('Error loading analytics cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 animate-pulse">
            <div className="w-10 h-10 bg-slate-100 rounded-xl mb-4" />
            <div className="h-7 bg-slate-100 rounded w-1/2 mb-2" />
            <div className="h-3 bg-slate-100 rounded w-3/4 mb-1" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-8"
    >
      {stats.map((stat) => {
        const cfg = CARD_CONFIG.find(c => c.key === stat.name) || CARD_CONFIG[0];
        const Icon = cfg.icon;
        const isCompletion = stat.name === 'Profile Completion';
        const pct = isCompletion ? parseInt(stat.value) : 0;

        return (
          <motion.div
            key={stat.name}
            variants={item}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 group cursor-default flex flex-col"
          >
            {/* Icon */}
            <div className={`w-10 h-10 rounded-xl ${cfg.bg} ${cfg.text} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>

            {/* Value */}
            <h3 className="text-2xl font-black text-slate-900 mb-0.5 leading-none">{stat.value}</h3>

            {/* Name */}
            <p className="text-xs font-semibold text-slate-500 mb-3 leading-tight">{stat.name}</p>

            {/* Completion bar for profile card */}
            {isCompletion && (
              <div className="w-full h-1.5 bg-slate-100 rounded-full mb-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`}
                />
              </div>
            )}

            {/* Trend */}
            <span className={`text-xs font-semibold ${stat.trendColor} bg-white/50 mt-auto`}>
              {stat.trend}
            </span>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
