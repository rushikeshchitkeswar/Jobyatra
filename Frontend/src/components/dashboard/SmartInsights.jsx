import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, TrendingUp, AlertCircle, User, Star,
  Lightbulb, Loader2, RefreshCw, ChevronRight
} from 'lucide-react';
import { candidateService } from '../../services/candidateService';
import { useNavigate } from 'react-router-dom';

const ICON_MAP = {
  Briefcase,
  TrendingUp,
  AlertCircle,
  User,
  Star,
  Lightbulb,
};

const TYPE_CONFIG = {
  info:    { bg: 'bg-blue-50',    border: 'border-blue-100',   text: 'text-blue-700',    icon: 'text-blue-500',    label: 'Insight'    },
  success: { bg: 'bg-emerald-50', border: 'border-emerald-100',text: 'text-emerald-700', icon: 'text-emerald-500', label: 'Great news' },
  warning: { bg: 'bg-amber-50',   border: 'border-amber-100',  text: 'text-amber-700',   icon: 'text-amber-500',   label: 'Heads up'   },
  tip:     { bg: 'bg-purple-50',  border: 'border-purple-100', text: 'text-purple-700',  icon: 'text-purple-500',  label: 'Pro tip'    },
};

const ACTION_MAP = {
  info:    { label: 'View Applications', path: '/dashboard/applied-jobs' },
  success: { label: 'View Applications', path: '/dashboard/applied-jobs' },
  warning: { label: 'Improve Resume',    path: '/dashboard/resume'       },
  tip:     { label: 'Complete Profile',  path: '/dashboard/profile'      },
};

export default function SmartInsights({ compact = false }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchInsights = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const res = await candidateService.getInsights();
      if (res.success) setInsights(res.data);
    } catch (err) {
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchInsights(); }, []);

  const displayInsights = compact ? insights.slice(0, 3) : insights;

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="h-5 bg-slate-100 rounded w-1/3 mb-4 animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-slate-50 rounded-xl p-4 mb-3 animate-pulse">
            <div className="h-3 bg-slate-100 rounded w-4/5 mb-2" />
            <div className="h-3 bg-slate-100 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Smart Insights</h3>
            <p className="text-xs text-slate-400 font-medium">Powered by your activity</p>
          </div>
        </div>
        <button
          onClick={() => fetchInsights(true)}
          className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
          title="Refresh insights"
        >
          <RefreshCw className={`w-4 h-4 text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        <div className="space-y-3">
          {displayInsights.map((insight, idx) => {
            const config = TYPE_CONFIG[insight.type] || TYPE_CONFIG.info;
            const action = ACTION_MAP[insight.type];
            const IconComponent = ICON_MAP[insight.icon] || Lightbulb;

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`flex gap-3 p-4 rounded-xl border ${config.bg} ${config.border} group`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center`}>
                  <IconComponent className={`w-4 h-4 ${config.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${config.text} opacity-70`}>
                    {config.label}
                  </div>
                  <p className={`text-sm font-medium leading-relaxed ${config.text}`}>
                    {insight.text}
                  </p>
                  {action && !compact && (
                    <button
                      onClick={() => navigate(action.path)}
                      className={`mt-2 flex items-center gap-1 text-xs font-semibold ${config.text} hover:gap-2 transition-all`}
                    >
                      {action.label}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>

      {compact && insights.length > 3 && (
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 w-full text-center text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors"
        >
          View all {insights.length} insights →
        </button>
      )}
    </div>
  );
}
