import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Ban, 
  ShieldAlert,
  Eye,
  RefreshCw,
  Shield,
  User as UserIcon,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const { user: currentUser } = useAuth();
  const [roleUpdating, setRoleUpdating] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({ 
        search: searchTerm, 
        page, 
        limit: 10 
      });
      setUsers(res.data);
      setTotal(res.total);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, page]);

  const handleUpdateStatus = async (userId, isBlocked) => {
    try {
      await adminService.updateUserStatus(userId, { 
        isBlocked, 
        accountStatus: isBlocked ? 'suspended' : 'active' 
      });
      toast.success(isBlocked ? 'User suspended' : 'User activated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    } finally {
      setActiveMenu(null);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
      if (userId === currentUser?._id && newRole !== 'admin') {
          return toast.error('You cannot change your own admin role');
      }

      try {
          setRoleUpdating(userId);
          await adminService.updateUserRole(userId, { role: newRole });
          toast.success(`Role updated to ${newRole}`);
          fetchUsers();
      } catch (error) {
          toast.error('Failed to update role');
      } finally {
          setRoleUpdating(null);
          setActiveMenu(null);
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage platform users, roles, and status.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <button 
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Table container with improved scrolling */}
        <div className="overflow-x-auto custom-scrollbar">
          <div className="inline-block min-w-full align-middle">
            {loading && users.length === 0 ? (
              <div className="flex items-center justify-center p-20">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Joined Date</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                {users.map((user, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                    key={user._id} 
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize
                        ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : ''}
                        ${user.role === 'recruiter' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                        ${user.role === 'user' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                      `}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${!user.isBlocked ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}
                      `}>
                        <span className={`w-1.5 h-1.5 rounded-full ${!user.isBlocked ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        {user.isBlocked ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === user._id ? null : user._id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {activeMenu === user._id && (
                        <div className="absolute right-8 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10 text-left">
                          <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Eye className="w-4 h-4 text-gray-400" /> View Profile
                          </button>
                          <div className="h-px bg-gray-100 my-1"></div>
                          {user.isBlocked ? (
                            <button 
                              onClick={() => handleUpdateStatus(user._id, false)}
                              className="w-full px-4 py-2 text-sm text-emerald-600 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <ShieldAlert className="w-4 h-4" /> Activate User
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleUpdateStatus(user._id, true)}
                              className="w-full px-4 py-2 text-sm text-amber-600 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Ban className="w-4 h-4" /> Suspend User
                            </button>
                          )}

                          <div className="h-px bg-gray-100 my-1"></div>
                          <div className="px-4 py-1.5 text-[10px] font-black uppercase text-gray-400 tracking-wider">Change Role</div>
                          
                          <button 
                            disabled={user.role === 'admin'}
                            onClick={() => handleUpdateRole(user._id, 'admin')}
                            className={`w-full px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 ${user.role === 'admin' ? 'text-indigo-600 font-bold' : 'text-gray-600'}`}
                          >
                            <Shield className={`w-4 h-4 ${user.role === 'admin' ? 'text-indigo-600' : 'text-gray-400'}`} /> Admin
                          </button>
                          
                          <button 
                            disabled={user.role === 'recruiter'}
                            onClick={() => handleUpdateRole(user._id, 'recruiter')}
                            className={`w-full px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 ${user.role === 'recruiter' ? 'text-blue-600 font-bold' : 'text-gray-600'}`}
                          >
                            <Briefcase className={`w-4 h-4 ${user.role === 'recruiter' ? 'text-blue-600' : 'text-gray-400'}`} /> Recruiter
                          </button>
                          
                          <button 
                            disabled={user.role === 'user'}
                            onClick={() => handleUpdateRole(user._id, 'user')}
                            className={`w-full px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 ${user.role === 'user' ? 'text-emerald-600 font-bold' : 'text-gray-600'}`}
                          >
                            <UserIcon className={`w-4 h-4 ${user.role === 'user' ? 'text-emerald-600' : 'text-gray-400'}`} /> Candidate
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
                {users.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <div>Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} entries</div>
          <div className="flex gap-1">
            <button 
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Prev
            </button>
            <button className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded font-medium">{page}</button>
            <button 
              onClick={() => setPage(prev => prev + 1)}
              disabled={page * 10 >= total}
              className="px-3 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
