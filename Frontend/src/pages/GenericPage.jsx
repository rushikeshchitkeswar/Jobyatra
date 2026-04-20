import React from 'react';
import PageLayout from '../components/PageLayout';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, CheckCircle2 } from 'lucide-react';

const StandardPage = ({ title, gradientText, sections }) => {
  return (
    <PageLayout 
      title={title} 
      gradientText={gradientText} 
      subtitle={`Last updated: March 2026. Please read our ${title.toLowerCase()} carefully.`}
    >
      <div className="max-w-4xl mx-auto space-y-16">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
             <div className="absolute top-0 right-0 p-8 flex opacity-0 group-hover:opacity-100 transition-opacity">
                {section.icon}
             </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-8">{idx + 1}. {section.title}</h2>
            <div className="space-y-6">
              {section.content.map((para, pIdx) => (
                <p key={pIdx} className="text-slate-600 text-lg leading-relaxed">{para}</p>
              ))}
              {section.bullets && (
                <ul className="space-y-4 pt-4">
                  {section.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex gap-4 text-slate-600 text-lg">
                      <CheckCircle2 size={24} className="text-primary flex-shrink-0 mt-1" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
};

const GenericPage = ({ type }) => {
  const contentMap = {
    privacy: {
      title: "Privacy",
      gradient: "Policy",
      sections: [
        {
          title: "Introduction",
          icon: <ShieldCheck size={64} className="text-primary/10" />,
          content: [
            "At JobYatra, we take your privacy seriously. This Policy explains how we collect, use, and protect your personal information when you use our platform.",
            "By using JobYatra, you agree to the collection and use of information in accordance with this policy."
          ]
        },
        {
          title: "Data Collection",
          content: [
            "We collect information that you provide directly to us when you create an account, upload a resume, or contact us.",
            "This may include your name, email address, phone number, work history, and educational background."
          ],
          bullets: [
            "Identity data (Name, Username)",
            "Contact data (Email, Phone)",
            "Professional data (Resume, Portfolio)",
            "Technical data (IP address, Browser type)"
          ]
        },
        {
          title: "How We Use Your Data",
          icon: <Eye size={64} className="text-secondary/10" />,
          content: [
            "Your data helps us provide you with the best possible job matches and improves overall platform performance.",
            "We do not sell your personal data to third parties."
          ]
        }
      ]
    },
    terms: {
      title: "Terms of",
      gradient: "Service",
      sections: [
        {
          title: "Agreement",
          icon: <Lock size={64} className="text-primary/10" />,
          content: [
            "These terms govern your use of the JobYatra website and services. Please read them carefully before creating an account.",
            "Violation of these terms may result in account termination."
          ]
        },
        {
          title: "User Responsibilities",
          content: [
            "Users must provide accurate information and maintain the security of their accounts.",
            "You are responsible for all activities that occur under your account."
          ],
          bullets: [
            "Must be at least 18 years old",
            "Must not post fraudulent job listings",
            "Must respect other users' privacy",
            "Must not scrape platform data"
          ]
        }
      ]
    },
    press: {
      title: "Press",
      gradient: "Center",
      sections: [
        {
          title: "Company News",
          content: [
            "JobYatra is revolutionizing the hiring landscape in India and beyond. View our latest announcements and company milestones.",
            "For press inquiries, please reach out to press@jobyatra.com."
          ]
        }
      ]
    },
    partners: {
      title: "Partner with",
      gradient: "JobYatra",
      sections: [
        {
          title: "Why Partner with Us?",
          content: [
            "Join an ecosystem of top hiring platforms and HR technology providers.",
            "Integrate your services with JobYatra to reach a wider audience of talent and employers."
          ]
        }
      ]
    },
    guide: {
      title: "Job Search",
      gradient: "Guide",
      sections: [
        {
          title: "Step 1: Profile Perfection",
          content: [
            "Your profile is your digital handshake. Learn how to optimize it for maximum visibility from top recruiters."
          ]
        },
        {
          title: "Step 2: Smart Search",
          content: [
            "Use our advanced filters to find jobs that truly match your skills and expectations."
          ]
        }
      ]
    },
    hiring: {
      title: "Hiring",
      gradient: "Solutions",
      sections: [
        {
          title: "Automated Screening",
          content: [
            "Save hundreds of hours with our AI-powered screening tools that filter the best candidates for your review."
          ]
        }
      ]
    },
    'talent-search': {
      title: "Talent",
      gradient: "Search",
      sections: [
        {
          title: "Advanced Sourcing",
          content: [
            "Find top passive candidates who aren't actively applying but are open to the right opportunity."
          ]
        }
      ]
    },
    'career-advice': {
      title: "Career",
      gradient: "Advice",
      sections: [
        {
          title: "Long-term Growth",
          content: [
            "Navigating your career path requires a strategy. Explore our deep dives into industry trends and growth strategies."
          ]
        }
      ]
    },
    'resume-tips': {
      title: "Resume",
      gradient: "Tips",
      sections: [
        {
          title: "ATS Optimization",
          content: [
            "90% of resumes are filtered by software before a human ever sees them. Learn how to beat the ATS."
          ]
        }
      ]
    },
    'interview-prep': {
      title: "Interview",
      gradient: "Preparation",
      sections: [
        {
          title: "Confidence First",
          content: [
            "Master common interview questions and learn how to present your achievements with confidence."
          ]
        }
      ]
    }
  };

  const content = contentMap[type] || contentMap.privacy;

  return <StandardPage {...content} />;
};

export default GenericPage;
