import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import LoadingScreen from './components/common/LoadingScreen'

// --- Eagerly loaded (critical path - always needed) ---
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'

// --- Public/Home page components (lazy) ---
const Hero = lazy(() => import('./components/Hero'))
const FeaturedJobs = lazy(() => import('./components/FeaturedJobs'))
const TopCompanies = lazy(() => import('./components/TopCompanies'))
const HowItWorks = lazy(() => import('./components/HowItWorks'))
const Testimonials = lazy(() => import('./components/Testimonials'))

// --- Auth Pages (lazy) ---
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))

// --- Public Pages (lazy) ---
const About = lazy(() => import('./pages/About'))
const Careers = lazy(() => import('./pages/Careers'))
const Contact = lazy(() => import('./pages/Contact'))
const Blog = lazy(() => import('./pages/Blog'))
const HelpCenter = lazy(() => import('./pages/HelpCenter'))
const Jobs = lazy(() => import('./pages/Jobs'))
const PostJob = lazy(() => import('./pages/PostJob'))
const Companies = lazy(() => import('./pages/Companies'))
const CompanyProfile = lazy(() => import('./pages/CompanyProfile'))
const GenericPage = lazy(() => import('./pages/GenericPage'))

// --- User Dashboard (lazy - heavy, only loaded when needed) ---
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'))
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'))
const DashboardProfile = lazy(() => import('./pages/dashboard/DashboardProfile'))
const DashboardAppliedJobs = lazy(() => import('./pages/dashboard/DashboardAppliedJobs'))
const DashboardSavedJobs = lazy(() => import('./pages/dashboard/DashboardSavedJobs'))
const DashboardRecommendedJobs = lazy(() => import('./pages/dashboard/DashboardRecommendedJobs'))
const DashboardInterviews = lazy(() => import('./pages/dashboard/DashboardInterviews'))
const DashboardMessages = lazy(() => import('./pages/dashboard/DashboardMessages'))
const DashboardResume = lazy(() => import('./pages/dashboard/DashboardResume'))
const DashboardAnalytics = lazy(() => import('./pages/dashboard/DashboardAnalytics'))
const DashboardNotifications = lazy(() => import('./pages/dashboard/DashboardNotifications'))
const DashboardSettings = lazy(() => import('./pages/dashboard/DashboardSettings'))

// --- Recruiter Dashboard (lazy - heavy) ---
const RecruiterLayout = lazy(() => import('./layouts/RecruiterLayout'))
const RecruiterDashboard = lazy(() => import('./pages/recruiter/RecruiterDashboard'))
const RecruiterPostJob = lazy(() => import('./pages/recruiter/PostJob'))
const RecruiterManageJobs = lazy(() => import('./pages/recruiter/ManageJobs'))
const RecruiterApplicants = lazy(() => import('./pages/recruiter/Applicants'))
const RecruiterCandidateProfile = lazy(() => import('./pages/recruiter/CandidateProfile'))
const RecruiterInterviews = lazy(() => import('./pages/recruiter/Interviews'))
const RecruiterHiringPipeline = lazy(() => import('./pages/recruiter/HiringPipeline'))
const RecruiterProfile = lazy(() => import('./pages/recruiter/RecruiterProfile'))
const RecruiterAnalytics = lazy(() => import('./pages/recruiter/Analytics'))
const RecruiterNotifications = lazy(() => import('./pages/recruiter/RecruiterNotifications'))
const RecruiterSettings = lazy(() => import('./pages/recruiter/RecruiterSettings'))

// --- Admin Dashboard (lazy - heavy) ---
const AdminLayout = lazy(() => import('./layouts/AdminLayout'))
const DashboardOverview = lazy(() => import('./pages/admin/DashboardOverview'))
const UserManagement = lazy(() => import('./pages/admin/UserManagement'))
const RecruiterManagement = lazy(() => import('./pages/admin/RecruiterManagement'))
const CompanyManagement = lazy(() => import('./pages/admin/CompanyManagement'))
const JobManagement = lazy(() => import('./pages/admin/JobManagement'))
const ApplicationsMonitoring = lazy(() => import('./pages/admin/ApplicationsMonitoring'))
const ActivityLogs = lazy(() => import('./pages/admin/ActivityLogs'))
const NotificationsManagement = lazy(() => import('./pages/admin/NotificationsManagement'))
const Reports = lazy(() => import('./pages/admin/Reports'))
const AdminSettings = lazy(() => import('./pages/admin/Settings'))

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');
  const isRecruiterRoute = location.pathname.startsWith('/recruiter');
  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar onLogout={handleLogout} />
      <main>
        <Suspense fallback={<LoadingScreen message="Loading page..." showTimeoutMessage={false} />}>
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <FeaturedJobs />
                <TopCompanies />
                <HowItWorks />
                <Testimonials />
              </>
            } />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Company Routes */}
            <Route path="/about" element={<About />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/press" element={<GenericPage type="press" />} />
            <Route path="/partners" element={<GenericPage type="partners" />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:companyName" element={<CompanyProfile />} />

            {/* Resources Routes */}
            <Route path="/blog" element={<Blog />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/guide" element={<GenericPage type="guide" />} />
            <Route path="/privacy" element={<GenericPage type="privacy" />} />
            <Route path="/terms" element={<GenericPage type="terms" />} />

            {/* Job Seekers Routes */}
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/career-advice" element={<GenericPage type="career-advice" />} />
            <Route path="/resume-tips" element={<GenericPage type="resume-tips" />} />
            <Route path="/interview-prep" element={<GenericPage type="interview-prep" />} />

            {/* Employers Routes */}
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/hiring" element={<GenericPage type="hiring" />} />
            <Route path="/talent-search" element={<GenericPage type="talent-search" />} />
            <Route path="/cookies" element={<GenericPage type="privacy" />} />

            {/* User Dashboard - Protected */}
            <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
              <Route index element={<DashboardHome />} />
              <Route path="profile" element={<DashboardProfile />} />
              <Route path="applied-jobs" element={<DashboardAppliedJobs />} />
              <Route path="saved-jobs" element={<DashboardSavedJobs />} />
              <Route path="recommended-jobs" element={<DashboardRecommendedJobs />} />
              <Route path="interviews" element={<DashboardInterviews />} />
              <Route path="messages" element={<DashboardMessages />} />
              <Route path="resume" element={<DashboardResume />} />
              <Route path="analytics" element={<DashboardAnalytics />} />
              <Route path="notifications" element={<DashboardNotifications />} />
              <Route path="settings" element={<DashboardSettings />} />
            </Route>

            {/* Recruiter Dashboard - Protected */}
            <Route path="/recruiter" element={<PrivateRoute><RecruiterLayout /></PrivateRoute>}>
              <Route index element={<RecruiterDashboard />} />
              <Route path="post-job" element={<RecruiterPostJob />} />
              <Route path="jobs" element={<RecruiterManageJobs />} />
              <Route path="applicants" element={<RecruiterApplicants />} />
              <Route path="applicants/:id" element={<RecruiterCandidateProfile />} />
              <Route path="interviews" element={<RecruiterInterviews />} />
              <Route path="pipeline" element={<RecruiterHiringPipeline />} />
              <Route path="company" element={<RecruiterProfile />} />
              <Route path="profile" element={<RecruiterProfile />} />
              <Route path="analytics" element={<RecruiterAnalytics />} />
              <Route path="notifications" element={<RecruiterNotifications />} />
              <Route path="messages" element={<DashboardMessages />} />
              <Route path="settings" element={<RecruiterSettings />} />
            </Route>

            {/* Admin Dashboard - Admin Only */}
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<DashboardOverview />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="recruiters" element={<RecruiterManagement />} />
              <Route path="companies" element={<CompanyManagement />} />
              <Route path="jobs" element={<JobManagement />} />
              <Route path="applications" element={<ApplicationsMonitoring />} />
              <Route path="analytics" element={<DashboardOverview />} />
              <Route path="logs" element={<ActivityLogs />} />
              <Route path="notifications" element={<NotificationsManagement />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Routes>
        </Suspense>
      </main>
      {(!isDashboardRoute && !isRecruiterRoute && !isAdminRoute) && <Footer />}
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  )
}

export default App
