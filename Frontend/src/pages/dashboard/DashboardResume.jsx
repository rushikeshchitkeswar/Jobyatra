import ResumeManager from '../../components/dashboard/ResumeManager';
import { FileText } from 'lucide-react';

export default function DashboardResume() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resume Manager</h1>
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
        </div>
        <p className="text-slate-500 font-medium">
          Upload, manage, and track the performance of your resumes.
        </p>
      </div>

      <ResumeManager />
    </div>
  );
}
