import RecruiterMessages from '../../components/dashboard/RecruiterMessages';
import { MessageCircle } from 'lucide-react';

export default function DashboardMessages() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recruiter Messages</h1>
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
        </div>
        <p className="text-slate-500 font-medium">
          All recruiter interactions and application updates in one place.
        </p>
      </div>

      <RecruiterMessages />
    </div>
  );
}
