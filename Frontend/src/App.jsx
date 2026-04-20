import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import FeaturedJobs from './components/FeaturedJobs'
import Login from './pages/Login'
import Register from './pages/Register'
import TopCompanies from './components/TopCompanies'
import HowItWorks from './components/HowItWorks'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'


// Components
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'

// Context
import { useAuth } from './context/AuthContext'

// New Pages
import About from './pages/About'
import Careers from './pages/Careers'
import Contact from './pages/Contact'
import Blog from './pages/Blog'
import HelpCenter from './pages/HelpCenter'
import Jobs from './pages/Jobs'
import PostJob from './pages/PostJob'
import Companies from './pages/Companies'
import CompanyProfile from './pages/CompanyProfile'
import GenericPage from './pages/GenericPage'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardHome from './pages/dashboard/DashboardHome'
import DashboardProfile from './pages/dashboard/DashboardProfile'
import DashboardAppliedJobs from './pages/dashboard/DashboardAppliedJobs'
import DashboardSavedJobs from './pages/dashboard/DashboardSavedJobs'
import DashboardRecommendedJobs from './pages/dashboard/DashboardRecommendedJobs'
import DashboardInterviews from './pages/dashboard/DashboardInterviews'
import DashboardMessages from './pages/dashboard/DashboardMessages'
import DashboardResume from './pages/dashboard/DashboardResume'
import DashboardAnalytics from './pages/dashboard/DashboardAnalytics'
import DashboardNotifications from './pages/dashboard/DashboardNotifications'
import DashboardSettings from './pages/dashboard/DashboardSettings'

// Recruiter Pages
import RecruiterLayout from './layouts/RecruiterLayout'
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard'
import RecruiterPostJob from './pages/recruiter/PostJob'
import RecruiterManageJobs from './pages/recruiter/ManageJobs'
import RecruiterApplicants from './pages/recruiter/Applicants'
import RecruiterCandidateProfile from './pages/recruiter/CandidateProfile'
import RecruiterInterviews from './pages/recruiter/Interviews'
import RecruiterHiringPipeline from './pages/recruiter/HiringPipeline'
import RecruiterCompanyProfile from './pages/recruiter/CompanyProfile'
import RecruiterProfile from './pages/recruiter/RecruiterProfile'
import RecruiterAnalytics from './pages/recruiter/Analytics'
import RecruiterNotifications from './pages/recruiter/RecruiterNotifications'
import RecruiterSettings from './pages/recruiter/RecruiterSettings'

// Admin Pages
import AdminLayout from './layouts/AdminLayout'
import DashboardOverview from './pages/admin/DashboardOverview'
import UserManagement from './pages/admin/UserManagement'
import RecruiterManagement from './pages/admin/RecruiterManagement'
import CompanyManagement from './pages/admin/CompanyManagement'
import JobManagement from './pages/admin/JobManagement'
import ApplicationsMonitoring from './pages/admin/ApplicationsMonitoring'
import ActivityLogs from './pages/admin/ActivityLogs'
import NotificationsManagement from './pages/admin/NotificationsManagement'
import Reports from './pages/admin/Reports'
import AdminSettings from './pages/admin/Settings'

import { Toaster } from 'react-hot-toast';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');
  const isRecruiterRoute = location.pathname.startsWith('/recruiter');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const showNavbar = true; // Navbar is always visible

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {showNavbar && <Navbar onLogout={handleLogout} />}
      <main>
        <Routes>
          <Route path="/" element={
            // <PrivateRoute>
            <>
              <Hero />
              <FeaturedJobs />
              <TopCompanies />
              <HowItWorks />
              <Testimonials />
            </>
            // </PrivateRoute>
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
      </main>
      {(!isDashboardRoute && !location.pathname.startsWith('/recruiter') && !location.pathname.startsWith('/admin')) && <Footer />}
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  )
}

export default App
