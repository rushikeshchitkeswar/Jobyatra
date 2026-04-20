import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  UserPlus, 
  Briefcase, 
  FileCheck, 
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  UserX,
  Settings,
  Bell
} from 'lucide-react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const getIcon = (action) => {
  switch (action) {
    case 'BLOCK_USER': return { icon: UserX, color: 'text-red-600', bg: 'bg-red-50' };
    case 'UNBLOCK_USER': return { icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' };
    case 'VERIFY_RECRUITER': return { icon: FileCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' };
    case 'UPDATE_SETTINGS': return { icon: Settings, color: 'text-amber-600', bg: 'bg-amber-50' };
    case 'BROADCAST_NOTIFICATION': return { icon: Bell, color: 'text-purple-600', bg: 'bg-purple-50' };
    case 'MODERATE_JOB_STATUS': return { icon: ShieldAlert, color: 'text-orange-600', bg: 'bg-orange-50' };
    case 'DELETE_JOB_ADMIN': return { icon: UserX, color: 'text-red-700', bg: 'bg-red-50' };
    default: return { icon: Briefcase, color: 'text-gray-600', bg: 'bg-gray-50' };
  }
};

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await adminService.getActivityLogs();
      setLogs(res.data);
    } catch (error) {
      toast.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.adminId?.name && log.adminId.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Activity Logs</h1>
          <p className="text-gray-500 mt-1">Real-time timeline of administrative actions.</p>
        </div>
        <button 
          onClick={fetchLogs}
          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search logs by admin or action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
            />
          </div>
        </div>

        <div className="p-6 min-h-[400px]">
          {loading && logs.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : (
            <div className="relative border-l border-gray-200 ml-3 space-y-8 pb-4">
              {filteredLogs.map((log, index) => {
                const { icon: Icon, color, bg } = getIcon(log.action);
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    key={log._id} 
                    className="relative pl-8 group"
                  >
                    <div className={`absolute -left-5 top-1 ${bg} ${color} w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm ring-1 ring-gray-100`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start flex-col sm:flex-row gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800">
                            <span className="font-semibold text-gray-900">{log.adminId?.name || 'Unknown Admin'}</span>
                            {' '}<span className="text-gray-600 font-medium">[{log.action.replace('_', ' ')}]</span>{' '}
                            on <span className="font-medium text-gray-900">{log.targetType}</span>
                            {log.details && (
                              <span className="text-gray-500 text-sm block mt-2 bg-gray-50 p-2 rounded-lg border border-gray-100 overflow-x-auto whitespace-pre-wrap break-words font-mono text-[11px]">
                                {typeof log.details === 'object' ? JSON.stringify(log.details, null, 2) : log.details}
                              </span>
                            )}
                          </p>
                        </div>
                        <span className="text-[11px] sm:text-sm text-gray-400 font-bold whitespace-nowrap bg-gray-50 px-2 py-1 rounded-md border border-gray-100 self-start sm:self-center">
                          {new Date(log.createdAt || log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {filteredLogs.length === 0 && !loading && (
                <div className="text-center py-20 text-gray-500">No activity logs found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
