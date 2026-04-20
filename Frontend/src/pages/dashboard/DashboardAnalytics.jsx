import DashboardCharts from '../../components/dashboard/DashboardCharts';
import SmartInsights from '../../components/dashboard/SmartInsights';
import { BarChart2 } from 'lucide-react';

export default function DashboardAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics</h1>
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-white" />
          </div>
        </div>
        <p className="text-slate-500 font-medium">
          Deep insights into your job search performance and trends.
        </p>
      </div>

      {/* Charts occupying top ⅔ */}
      <DashboardCharts />

      {/* Insights panel below */}
      <SmartInsights />
    </div>
  );
}
