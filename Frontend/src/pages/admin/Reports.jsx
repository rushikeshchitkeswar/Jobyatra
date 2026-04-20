import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  FileText, 
  Users, 
  Briefcase, 
  FileCheck,
  Calendar,
  Filter,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  MoreVertical,
  Table
} from 'lucide-react';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const ReportCard = ({ title, description, icon: Icon, color, bg, onExport }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full"
  >
    <div className="flex items-start gap-4 mb-6">
      <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
    
    <div className="mt-auto space-y-4">
      <div className="flex gap-2">
        <button 
          onClick={() => onExport('csv')}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium rounded-lg transition-colors border border-indigo-100"
        >
          <Download className="w-4 h-4" /> CSV
        </button>
        <button 
          onClick={() => onExport('json')}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-lg transition-colors border border-slate-100"
        >
          <Table className="w-4 h-4" /> JSON
        </button>
      </div>
    </div>
  </motion.div>
);

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await adminService.getReports();
      setReports(res.data);
    } catch (error) {
      toast.error('Failed to fetch incident reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id) => {
    try {
      await adminService.resolveReport(id, { status: 'resolved', adminNotes: 'Issues addressed by admin.' });
      toast.success('Report resolved');
      fetchReports();
    } catch (error) {
      toast.error('Failed to resolve report');
    }
  };

  const downloadFile = (content, fileName, contentType) => {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const convertToCSV = (objArray) => {
    const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    if (array.length === 0) return '';
    const headers = Object.keys(array[0]).join(',');
    const rows = array.map(obj => 
      Object.values(obj).map(val => 
        typeof val === 'object' ? `"${JSON.stringify(val).replace(/"/g, '""')}"` : `"${val}"`
      ).join(',')
    );
    return [headers, ...rows].join('\n');
  };

  const handleExport = async (target, format) => {
    try {
      setExporting(true);
      let data = [];
      let fileName = `${target}_export_${new Date().toISOString().split('T')[0]}`;

      if (target === 'users') {
        const res = await adminService.getUsers({ limit: 1000 });
        data = res.data;
      } else if (target === 'jobs') {
        const res = await adminService.getJobs({ limit: 1000 });
        data = res.data;
      } else if (target === 'applications') {
        const res = await adminService.getApplications();
        data = res.data;
      }

      if (format === 'csv') {
        const csv = convertToCSV(data);
        downloadFile(csv, `${fileName}.csv`, 'text/csv');
      } else {
        downloadFile(JSON.stringify(data, null, 2), `${fileName}.json`, 'application/json');
      }
      toast.success(`${target} exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Failed to export ${target}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Moderation</h1>
          <p className="text-gray-500 mt-1">Manage user reports and platform data exports.</p>
        </div>
      </div>

      {/* Incident Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            User Flagged Incidents
          </h2>
          <button onClick={fetchReports} className="text-gray-500 hover:text-indigo-600">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto min-h-[300px]">
          {loading && reports.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Report Info</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Target</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{report.reason}</div>
                      <div className="text-xs text-gray-500 mt-1">By: {report.reporter?.name || 'Anonymous'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-700">{report.targetType}: {report.targetId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border
                        ${report.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}
                      `}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {report.status === 'pending' && (
                        <button 
                          onClick={() => handleResolve(report._id)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-all"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && !loading && (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-gray-500">No pending reports</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard 
          title="Users Export" 
          description="Detailed list of all registered users, roles, and registration dates."
          icon={Users}
          color="text-blue-600"
          bg="bg-blue-50"
          onExport={(format) => handleExport('users', format)}
        />
        <ReportCard 
          title="Jobs Export" 
          description="Comprehensive data on all job postings, statuses, and companies."
          icon={Briefcase}
          color="text-amber-600"
          bg="bg-amber-50"
          onExport={(format) => handleExport('jobs', format)}
        />
        <ReportCard 
          title="Applications Export" 
          description="Full export of job applications, candidate stages, and hiring outcomes."
          icon={FileCheck}
          color="text-emerald-600"
          bg="bg-emerald-50"
          onExport={(format) => handleExport('applications', format)}
        />
      </div>
    </div>
  );
};

export default Reports;
