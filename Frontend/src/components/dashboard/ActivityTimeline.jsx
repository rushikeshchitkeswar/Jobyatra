import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Send, Bookmark, FileEdit, CheckCircle2,
  Phone, Eye, MessageCircle, Star, Loader2
} from 'lucide-react';
import notificationService from '../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';

const TYPE_CONFIG = {
  Application: { icon: Send,         bg: 'bg-blue-100',    color: 'text-blue-600'    },
  Job:         { icon: Bookmark,      bg: 'bg-indigo-100',  color: 'text-indigo-600'  },
  Profile:     { icon: Eye,           bg: 'bg-purple-100',  color: 'text-purple-600'  },
  Interview:   { icon: Phone,         bg: 'bg-cyan-100',    color: 'text-cyan-600'    },
  Message:     { icon: MessageCircle, bg: 'bg-amber-100',   color: 'text-amber-600'   },
  System:      { icon: CheckCircle2,  bg: 'bg-emerald-100', color: 'text-emerald-600' },
  Offer:       { icon: Star,          bg: 'bg-yellow-100',  color: 'text-yellow-600'  },
};

function timeAgo(dateStr) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return 'recently';
  }
}

export default function ActivityTimeline() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await notificationService.getNotifications();
        if (res.success) {
          setActivities(res.data.slice(0, 8));
        }
      } catch (err) {
        console.error('Error fetching activity timeline:', err);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-full">
        <div className="h-5 bg-slate-100 rounded animate-pulse w-1/2 mb-6" />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex gap-4 mb-6">
            <div className="w-8 h-8 bg-slate-100 rounded-full animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-3 bg-slate-100 rounded animate-pulse w-3/4" />
              <div className="h-2 bg-slate-100 rounded animate-pulse w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
        {activities.length > 0 && (
          <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
            {activities.length} events
          </span>
        )}
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
            <CheckCircle2 className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No activity yet</p>
          <p className="text-xs text-slate-400 mt-1">Apply to jobs to see your activity here</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute top-4 left-4 h-full w-px bg-slate-100 -z-10" />
          <div className="space-y-6">
            {activities.map((activity, index) => {
              const cfg = TYPE_CONFIG[activity.type] || TYPE_CONFIG.System;
              const Icon = cfg.icon;

              return (
                <motion.div
                  key={activity._id || index}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.06 }}
                  className="flex gap-3 group"
                >
                  <div className={`relative w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.color} ring-4 ring-white shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 pb-1 pt-0.5">
                    <div className="flex justify-between items-start gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-slate-900 leading-snug">{activity.message}</p>
                      <span className="text-xs font-medium text-slate-400 whitespace-nowrap flex-shrink-0">
                        {timeAgo(activity.createdAt)}
                      </span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.color}`}>
                      {activity.type || 'Event'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
