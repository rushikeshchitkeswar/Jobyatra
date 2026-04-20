import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  CheckCircle2, 
  Circle, 
  ArrowRight,
  Zap,
  Star
} from 'lucide-react';
import { candidateService } from '../../services/candidateService';

export default function ProfileCompletion() {
  const [stats, setStats] = useState({
    percentage: 0,
    missingFields: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateStrength = async () => {
      try {
        const response = await candidateService.getProfile();
        if (response.success) {
          setStats({
            percentage: response.data.completionPercentage || 0,
            missingFields: response.data.missingSections || []
          });
        }
      } catch (error) {
        console.error('Error calculating strength:', error);
      } finally {
        setLoading(false);
      }
    };
    calculateStrength();
  }, []);

  if (loading) return (
    <div className="h-48 bg-white rounded-[2.5rem] animate-pulse border border-slate-100" />
  );

  const getStrengthLabel = (p) => {
    if (p < 30) return { label: 'Novice', color: 'text-rose-500', bg: 'bg-rose-50' };
    if (p < 70) return { label: 'Intermediate', color: 'text-amber-500', bg: 'bg-amber-50' };
    return { label: 'All-Star', color: 'text-emerald-500', bg: 'bg-emerald-50' };
  };

  const strength = getStrengthLabel(stats.percentage);

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/20">
              <Zap size={20} fill="currentColor" />
            </div>
            <h3 className="font-black text-slate-900 uppercase tracking-tighter text-lg italic">Profile Strength</h3>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${strength.bg} ${strength.color} border border-current/10`}>
            {strength.label}
          </span>
        </div>

        <div className="relative pt-1 mb-8">
          <div className="flex mb-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{stats.percentage}%</span>
              <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Complete</span>
            </div>
          </div>
          <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-slate-100 p-1">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${stats.percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
            />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recommended Actions</p>
          {stats.missingFields.slice(0, 3).map((section, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 hover:border-blue-400 transition-colors group/item cursor-pointer">
              <div className="flex items-center gap-3">
                <Circle size={14} className="text-slate-300 group-hover/item:text-blue-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700">Add {section.label}</span>
                  <span className="text-[10px] font-medium text-slate-400">Adds {section.weight}% to strength</span>
                </div>
              </div>
              <ArrowRight size={14} className="text-slate-300 group-hover/item:translate-x-1 transition-transform" />
            </div>
          ))}
          {stats.percentage === 100 && (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600">
              <CheckCircle2 size={20} />
              <span className="text-sm font-bold">Your profile is legendary!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
