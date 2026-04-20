import React, { useState } from 'react';
import PageLayout from '../components/PageLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, CheckCircle2 } from 'lucide-react';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className="text-lg font-semibold text-slate-800 group-hover:text-primary transition-colors">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-slate-400 group-hover:text-primary"
        >
          <ChevronDown size={24} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-slate-600 leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HelpCenter = () => {
  const faqs = [
    {
      question: "How do I apply for jobs on JobYatra?",
      answer: "Applying for jobs is easy! Once you've created an account and uploaded your resume, simply click the 'Apply Now' button on any job listing. You can track your applications in your dashboard."
    },
    {
      question: "How do I upload or update my resume?",
      answer: "Go to your 'Profile' section after logging in. You'll find an 'Upload Resume' button. We support PDF and DOCX formats up to 5MB."
    },
    {
      question: "How do recruiters contact candidates?",
      answer: "Recruiters can contact you through our internal messaging system or via the email address associated with your JobYatra account. Make sure to keep your contact details updated!"
    },
    {
      question: "Is JobYatra free for job seekers?",
      answer: "Yes, JobYatra is 100% free for job seekers. You can browse, search, and apply for as many jobs as you like without any cost."
    }
  ];

  return (
    <PageLayout 
      title="How can we" 
      gradientText="help you?" 
      subtitle="Find answers to common questions and learn how to make the most of JobYatra."
    >
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8 text-primary font-bold uppercase tracking-wider text-sm">
          <HelpCircle size={20} />
          <span>Frequently Asked Questions</span>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-100 border border-slate-100 p-8">
          {faqs.map((faq, idx) => (
            <FAQItem key={idx} question={faq.question} answer={faq.answer} />
          ))}
        </div>

        <div className="mt-16 bg-gradient-jobyatra p-8 md:p-12 rounded-3xl text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
            Our support team is always here to help you with any issues or queries you might have.
          </p>
          <button className="bg-white text-primary font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all">
            Contact Support
          </button>
        </div>
      </div>
    </PageLayout>
  );
};

export default HelpCenter;
