import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Send, 
  Users, 
  Building2, 
  AlertCircle,
  Megaphone,
  RefreshCw
} from 'lucide-react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const NotificationsManagement = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [notificationType, setNotificationType] = useState('System');
  const [sending, setSending] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      await adminService.broadcastNotification({
        title,
        message,
        targetAudience,
        type: notificationType
      });
      toast.success('Notification broadcasted successfully!');
      setTitle('');
      setMessage('');
    } catch (error) {
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications Management</h1>
        <p className="text-gray-500 mt-1">Send platform-wide announcements, alerts, and updates to users.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-600" />
                Notification Composer
              </h2>
            </div>
            
            <form onSubmit={handleSend} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'all', label: 'All Users', icon: Users },
                      { id: 'candidates', label: 'Candidates', icon: Users },
                      { id: 'recruiters', label: 'Recruiters', icon: Building2 },
                    ].map(type => (
                      <label 
                        key={type.id}
                        className={`
                          flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all
                          ${targetAudience === type.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-indigo-200 text-gray-600 hover:bg-gray-50'}
                        `}
                      >
                        <input 
                          type="radio" 
                          name="audience" 
                          value={type.id} 
                          checked={targetAudience === type.id}
                          onChange={(e) => setTargetAudience(e.target.value)}
                          className="sr-only"
                        />
                        <type.icon className="w-5 h-5 mb-2" />
                        <span className="text-sm font-medium">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notification Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="type" 
                        value="System"
                        checked={notificationType === 'System'}
                        onChange={(e) => setNotificationType(e.target.value)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-gray-700 font-medium flex items-center gap-1"><Megaphone className="w-4 h-4 text-blue-500" /> Announcement</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="type" 
                        value="Alert"
                        checked={notificationType === 'Alert'}
                        onChange={(e) => setNotificationType(e.target.value)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-gray-700 font-medium flex items-center gap-1"><AlertCircle className="w-4 h-4 text-amber-500" /> System Alert</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Scheduled Maintenance Notice"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
                  <textarea 
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows="5"
                    placeholder="Enter the notification message here..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="submit" 
                  disabled={sending}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sending ? 'Sending...' : 'Send Broadcast'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>

        <div className="md:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm border border-indigo-400 p-6 text-white"
          >
            <Bell className="w-8 h-8 mb-4 text-white/80" />
            <h3 className="text-lg font-bold mb-2">Broadcast Best Practices</h3>
            <ul className="space-y-2 text-sm text-indigo-50 list-disc list-inside">
              <li>Keep titles short and descriptive</li>
              <li>Don't spam users too frequently</li>
              <li>Use Alerts only for critical issues</li>
              <li>Proofread before sending to "All Users"</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsManagement;
