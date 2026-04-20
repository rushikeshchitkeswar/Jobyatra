import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Linkedin, 
  Twitter, 
  Github, 
  Instagram, 
  Mail, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { user } = useAuth();
  
  const allSections = [
    {
      title: "Company",
      links: [
        { name: "About", path: "/about" },
        { name: "Careers", path: "/careers" },
        { name: "Contact", path: "/contact" },
        { name: "Press", path: "/press" },
        { name: "Partner with Us", path: "/partners" },
      ]
    },
    {
      title: "Resources",
      links: [
        { name: "Blog", path: "/blog" },
        { name: "Help Center", path: "/help" },
        { name: "Job Search Guide", path: "/guide" },
        { name: "Privacy Policy", path: "/privacy" },
        { name: "Terms of Service", path: "/terms" },
      ]
    },
    {
      title: "Job Seekers",
      links: [
        { name: "Browse Jobs", path: "/jobs" },
        { name: "Career Advice", path: "/career-advice" },
        { name: "Resume Tips", path: "/resume-tips" },
        { name: "Interview Preparation", path: "/interview-prep" },
      ]
    },
    {
      title: "Employers",
      links: [
        { name: "Post a Job", path: "/post-job" },
        { name: "Hiring Solutions", path: "/hiring" },
        { name: "Talent Search", path: "/talent-search" },
      ]
    }
  ];

  // Role-based filtering logic
  const footerSections = allSections.filter(section => {
    if (!user) return true; // Show all for guest users
    
    if (user.role === 'user') {
      // Candidate: Hide Employers
      return section.title !== 'Employers';
    }
    
    if (user.role === 'recruiter') {
      // Recruiter: Hide Job Seekers
      return section.title !== 'Job Seekers';
    }
    
    return true; // Admin or other roles see everything
  });

  const socialLinks = [
    { icon: <Linkedin size={20} />, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: <Twitter size={20} />, href: "https://twitter.com", label: "Twitter" },
    { icon: <Github size={20} />, href: "https://github.com", label: "GitHub" },
    { icon: <Instagram size={20} />, href: "https://instagram.com", label: "Instagram" },
  ];

  return (
    <footer className="relative text-slate-300 overflow-hidden pt-20 pb-10" style={{ background: 'linear-gradient(to bottom, #0f172a, #1e293b)' }}>
      {/* Background Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Top CTA Strip */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative mb-20 p-8 md:p-12 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm overflow-hidden group"
        >
          {/* CTA Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Ready to start your <span className="gradient-text">career journey?</span>
              </h2>
              <p className="text-slate-400 text-lg">
                Join thousands of professionals finding their dream jobs on JobYatra.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                to="/jobs" 
                className="gradient-btn px-8 py-4 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 active:scale-95"
              >
                Find Jobs <ChevronRight size={18} />
              </Link>
              <Link 
                to="/post-job" 
                className="px-8 py-4 rounded-xl font-semibold bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 transition-all duration-300 active:scale-95"
              >
                Post a Job
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 mb-16">
          {footerSections.map((section, idx) => (
            <div key={idx} className="flex flex-col gap-6">
              <h3 className="text-white font-bold text-lg">{section.title}</h3>
              <ul className="flex flex-col gap-3">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link 
                      to={link.path} 
                      className="group relative flex items-center text-slate-400 hover:text-white transition-colors duration-300 py-1"
                    >
                      <span>{link.name}</span>
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social Links Column */}
          <div className="flex flex-col gap-6">
            <h3 className="text-white font-bold text-lg">Connect With Us</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Stay updated with the latest job opportunities and career advice.
            </p>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 group relative"
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-jobyatra opacity-0 group-hover:opacity-100 blur transition-opacity duration-300 scale-110" />
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="relative z-10"
                  >
                    {social.icon}
                  </motion.div>
                </a>
              ))}
            </div>
            {/* Newsletter Subscription (Bonus touch) */}
            <div className="mt-4 flex flex-col gap-3">
              <p className="text-slate-400 text-sm">Subscribe to our newsletter</p>
              <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="bg-transparent border-none focus:ring-0 text-sm px-3 py-2 w-full text-white" 
                />
                <button className="bg-primary hover:bg-primary-dark text-white rounded-md p-2 transition-colors">
                  <Mail size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-10" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <p>© 2026 JobYatra — All rights reserved</p>
            <span className="hidden md:inline text-slate-800">|</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p>System operational</p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link to="/cookies" className="hover:text-slate-300 transition-colors">Cookies</Link>
            <button className="flex items-center gap-1 hover:text-slate-300 transition-colors">
              English (US) <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
