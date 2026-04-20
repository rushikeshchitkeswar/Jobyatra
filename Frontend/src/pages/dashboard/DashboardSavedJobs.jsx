import SavedJobsSection from '../../components/dashboard/SavedJobsSection';

export default function DashboardSavedJobs() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Saved Jobs</h1>
        <p className="text-slate-500 font-medium mt-1">Jobs you've kept an eye on for later.</p>
      </div>

      <SavedJobsSection />
    </div>
  );
}
