import UpcomingInterviews from '../../components/dashboard/UpcomingInterviews';
import { Calendar } from 'lucide-react';

export default function DashboardInterviews() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Interviews</h1>
          <p className="text-slate-500 font-medium mt-1">
            View, prepare and join your upcoming and past interviews.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
          <Calendar className="w-4 h-4" />
          Interview Schedule
        </div>
      </div>

      <UpcomingInterviews />
    </div>
  );
}
