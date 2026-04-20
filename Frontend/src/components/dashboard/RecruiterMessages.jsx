import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Send, User, Building2, Clock,
  Loader2, Search, Inbox, Star, MoreHorizontal, CheckCheck,
  ChevronLeft, ArrowRight
} from 'lucide-react';
import notificationService from '../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';

// We use the notifications endpoint to surface recruiter messages
// (type === 'Message' or other recruiter-type notifications)
export default function RecruiterMessages() {
  const [messages, setMessages]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected]   = useState(null);
  const [mobileDetail, setMobileDetail] = useState(false);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await notificationService.getNotifications();
        if (res.success) {
          const msgs = res.data.filter(n =>
            n.type === 'Message' ||
            n.type === 'Interview' ||
            n.type === 'Application' ||
            n.type === 'Offer'
          );
          setMessages(msgs);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const TYPE_COLORS = {
    Message:     'text-blue-600 bg-blue-50',
    Interview:   'text-cyan-600 bg-cyan-50',
    Application: 'text-purple-600 bg-purple-50',
    Offer:       'text-emerald-600 bg-emerald-50',
  };

  const filtered = messages.filter(m =>
    m.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (msg) => {
    setSelected(msg);
    setMobileDetail(true);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    alert('Reply feature coming soon! Recruiter messaging is being integrated.');
    setReplyText('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-160px)] md:h-[calc(100vh-200px)] min-h-[500px] md:min-h-[600px] bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative">
      {/* Left panel — thread list */}
      <div className={`
        w-full md:w-80 flex-shrink-0 border-r border-slate-100 flex flex-col transition-all duration-300
        ${mobileDetail ? 'hidden md:flex' : 'flex'}
      `}>
        {/* Search */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search messages…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all font-medium"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
                <Inbox className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-600">No messages yet</p>
              <p className="text-xs text-slate-400 mt-1">Recruiters will reach out here</p>
            </div>
          ) : (
            <AnimatePresence>
              {filtered.map((msg, idx) => {
                const isSelected = selected?._id === msg._id;
                const badgeClass = TYPE_COLORS[msg.type] || 'text-slate-600 bg-slate-100';

                return (
                  <motion.button
                    key={msg._id || idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => handleSelect(msg)}
                    className={`w-full text-left px-4 py-6 border-b border-slate-50 hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${badgeClass}`}>
                            {msg.type || 'Update'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                            {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : ''}
                          </span>
                        </div>
                        <p className={`text-xs mt-1.5 line-clamp-2 ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-500 font-medium'}`}>{msg.message}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Right panel — message detail */}
      <div className={`
        flex-1 flex flex-col bg-slate-50/30
        ${!mobileDetail ? 'hidden md:flex' : 'flex'}
      `}>
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-blue-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">Select a notification</h3>
            <p className="text-sm text-slate-400 max-w-xs">
              Choose a thread from the list to read relevant recruiter updates and details.
            </p>
          </div>
        ) : (
          <>
            {/* Message header */}
            <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setMobileDetail(false)}
                  className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 hidden sm:flex items-center justify-center shadow-sm">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 tracking-tight">{selected.type} Update</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {selected.createdAt ? formatDistanceToNow(new Date(selected.createdAt), { addSuffix: true }) : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
                  <Star className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Message body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl rounded-tl-none p-6 border border-slate-100 shadow-sm relative">
                   {/* Avatar Bubble */}
                  <div className="absolute -left-12 top-0 hidden lg:block">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{selected.message}</p>
                  
                  <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-slate-50">
                    <CheckCheck className="w-4 h-4 text-blue-500" />
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">System Confirmed • Recruitment Update</span>
                  </div>
                </div>

                {selected.link && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <a
                      href={selected.link}
                      className="group flex items-center justify-between p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all font-black text-xs uppercase tracking-widest"
                    >
                      <span>Explore related details</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Reply box */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="max-w-3xl mx-auto flex items-end gap-3">
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-blue-400 focus-within:bg-white transition-all">
                  <textarea
                    rows={1}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full text-sm text-slate-700 bg-transparent resize-none outline-none placeholder-slate-400 font-medium py-1"
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                  />
                </div>
                <button
                  onClick={handleSendReply}
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-blue-500/30 flex-shrink-0 active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
