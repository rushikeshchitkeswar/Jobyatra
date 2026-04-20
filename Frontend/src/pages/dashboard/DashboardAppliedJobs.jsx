import KanbanBoard from '../../components/dashboard/KanbanBoard';

export default function DashboardAppliedJobs() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Application Tracker</h1>
          <p className="text-slate-500 font-medium mt-1">
            Track every job across all stages of your search journey.
          </p>
        </div>
      </div>

      <KanbanBoard />
    </div>
  );
}
