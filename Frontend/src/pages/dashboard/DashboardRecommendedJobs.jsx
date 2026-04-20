import RecommendedJobsSection from '../../components/dashboard/RecommendedJobsSection';

export default function DashboardRecommendedJobs() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recommended Jobs</h1>
        <p className="text-slate-500 font-medium mt-1">Jobs tailored to your skills and preferences.</p>
      </div>

      <RecommendedJobsSection />
    </div>
  );
}
