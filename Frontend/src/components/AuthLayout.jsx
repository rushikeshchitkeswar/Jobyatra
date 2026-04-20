import React from 'react';
import { motion } from 'framer-motion';

const AuthLayout = ({ children, illustration, title, subtitle }) => {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col lg:flex-row">
      {/* Left Side: Form Section */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-white">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
            <p className="text-slate-500">{subtitle}</p>
          </div>
          {children}
        </motion.div>
      </div>

      {/* Right Side: Visual Section */}
      <div className="flex-1 bg-slate-50 relative overflow-hidden hidden lg:flex items-center justify-center p-12">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100/50 rounded-full blur-3xl -ml-32 -mb-32"></div>
        
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 w-full max-w-lg flex flex-col items-center"
        >
          <div className="w-full drop-shadow-2xl">
            {illustration}
          </div>
          
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Elevate Your Career with JobYatra</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Join thousands of professionals finding their next big opportunity on India's most modern job portal.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Mobile Illustration Section (Visible below form on mobile) */}
      <div className="lg:hidden bg-slate-50 p-8 flex flex-col items-center border-t border-slate-100">
          <div className="w-48 h-48 mb-6">
            {illustration}
          </div>
          <p className="text-slate-500 text-center text-sm">
            Elevate Your Career with JobYatra
          </p>
      </div>
    </div>
  );
};

export default AuthLayout;
