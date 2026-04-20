import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Building2, 
  MoreHorizontal, 
  Globe, 
  ExternalLink,
  RefreshCw,
  CheckCircle,
  XCircle,
  Trash2,
  AlertTriangle,
  Info,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  User,
  X
} from 'lucide-react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const DetailModal = ({ company, onClose }) => {
  if (!company) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-900">Company Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              {company.companyInfo?.logo ? (
                <img src={company.companyInfo.logo} alt={company.companyInfo.name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-10 h-10 text-gray-300" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-2xl font-bold text-gray-900">{company.companyInfo?.name}</h3>
                {company.user?.recruiterVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <CheckCircle className="w-3 h-3" /> VERIFIED
                  </span>
                )}
              </div>
              <p className="text-indigo-600 font-semibold">{company.companyInfo?.industry}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {company.companyInfo?.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {company.companyInfo?.size || 'Size unknown'}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">About Company</h4>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-gray-700 leading-relaxed">
              {company.companyInfo?.description || 'No description provided.'}
            </div>
          </div>

          {/* Links & Social */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Online Presence</h4>
              <div className="space-y-3">
                {company.companyInfo?.website && (
                  <a href={company.companyInfo.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-indigo-600 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                      <Globe className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="text-sm font-medium">Official Website</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}
                {company.socialLinks?.linkedin && (
                  <a href={company.socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-blue-600 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Linkedin className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">LinkedIn Profile</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}
                {company.socialLinks?.twitter && (
                  <a href={company.socialLinks.twitter} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-sky-500 transition-colors group">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center group-hover:bg-sky-100 transition-colors">
                      <Twitter className="w-4 h-4 text-sky-500" />
                    </div>
                    <span className="text-sm font-medium">Twitter / X</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Recruiter Details</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{company.user?.name}</p>
                    <p className="text-xs text-gray-500">{company.personalInfo?.jobTitle || 'Recruiter'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium">{company.user?.email}</span>
                </div>
                {company.personalInfo?.phone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium">{company.personalInfo.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 mt-4 bg-gray-50 rounded-b-2xl border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600 font-bold">
            <Briefcase className="w-5 h-5" />
            <span>{company.jobCount} Total Postings</span>
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
          >
            Close Details
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCompanies();
      setCompanies(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch company profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleVerify = async (userId, verified) => {
    try {
      await adminService.verifyRecruiter(userId, verified);
      toast.success(verified ? 'Company Approved' : 'Approval Revoked');
      fetchCompanies(); // Refresh data
    } catch (error) {
      toast.error('Failed to update verification status');
    }
  };

  const handleDelete = async (profileId) => {
    if (!window.confirm('Are you sure you want to delete this company profile? This action cannot be undone.')) return;
    try {
      await adminService.deleteCompany(profileId);
      toast.success('Company profile deleted');
      fetchCompanies();
    } catch (error) {
      toast.error('Failed to delete company profile');
    }
  };

  const filteredCompanies = companies.filter(company => {
    const name = company.companyInfo?.name || '';
    const industry = company.companyInfo?.industry || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         industry.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'verified') return matchesSearch && company.user?.recruiterVerified;
    if (filterStatus === 'pending') return matchesSearch && !company.user?.recruiterVerified;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Management</h1>
          <p className="text-gray-500 mt-1">Review and manage recruiter-submitted company profiles.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchCompanies}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-gray-200"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search by company name or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending Approval</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-white min-h-[400px]">
          {loading && companies.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
              <RefreshCw className="w-10 h-10 animate-spin mb-4" />
              <p>Fetching platform companies...</p>
            </div>
          ) : (
            <AnimatePresence mode='popLayout'>
              {filteredCompanies.map((company, idx) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  key={company._id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all group overflow-hidden flex flex-col"
                >
                  <div className={`h-1 w-full ${company.user?.recruiterVerified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden hover:border-indigo-200 transition-colors">
                          {company.companyInfo?.logo ? (
                            <img src={company.companyInfo.logo} alt={company.companyInfo.name} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-7 h-7 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
                              {company.companyInfo?.name || 'Unnamed Company'}
                            </h3>
                            {company.user?.recruiterVerified && (
                              <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                            )}
                          </div>
                          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mt-0.5">
                            {company.companyInfo?.industry || 'General'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedCompany(company)}
                        className="text-gray-400 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 transition-all shadow-sm"
                        title="View Full Details"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="space-y-3 mb-6 flex-1">
                      <p className="text-sm text-gray-500 line-clamp-2 italic">
                        "{company.companyInfo?.description || 'No description provided by recruiter.'}"
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate">{company.companyInfo?.location || 'Not Specified'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="font-bold text-gray-900">{company.jobCount}</span> Active Jobs
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 border-t border-gray-100 pt-4 mt-auto">
                      {company.user?.recruiterVerified ? (
                        <button 
                          onClick={() => handleVerify(company.user._id, false)}
                          className="flex-1 py-2 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors border border-amber-100 flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" /> Revoke
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleVerify(company.user._id, true)}
                          className="flex-1 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-100 flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(company._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          
          {filteredCompanies.length === 0 && !loading && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No companies found</h3>
              <p className="text-gray-500 max-w-xs mt-1">Try adjusting your search or filters to find what you're looking for.</p>
              <button 
                onClick={() => {setSearchTerm(''); setFilterStatus('all');}}
                className="mt-6 text-indigo-600 font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedCompany && (
          <DetailModal 
            company={selectedCompany} 
            onClose={() => setSelectedCompany(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompanyManagement;
