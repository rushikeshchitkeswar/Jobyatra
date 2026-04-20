import React from 'react';
import PageLayout from '../components/PageLayout';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight } from 'lucide-react';

const BlogCard = ({ title, excerpt, category, date, author, image }) => {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
    >
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10" />
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        <div className="absolute top-4 left-4 z-20">
          <span className="bg-primary/90 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-sm">
            {category}
          </span>
        </div>
      </div>
      
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User size={14} />
            <span>{author}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
          {title}
        </h3>
        
        <p className="text-slate-600 mb-8 line-clamp-3 leading-relaxed">
          {excerpt}
        </p>
        
        <div className="mt-auto">
          <button className="flex items-center gap-2 text-primary font-bold group">
            Read Full Article <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Blog = () => {
  const posts = [
    {
      title: "10 Tips to Crack Your First Job Interview",
      excerpt: "Prepare yourself with these essential strategies to impress recruiters and land your dream job in your first attempt.",
      category: "Interview Prep",
      date: "Mar 10, 2026",
      author: "Aditi Sharma",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&auto=format&fit=crop"
    },
    {
      title: "How to Build a Resume for Tech Jobs",
      excerpt: "Technical recruiters scan resumes in seconds. Learn how to format your skills and experience to stand out from the crowd.",
      category: "Career Advice",
      date: "Mar 08, 2026",
      author: "Rahul Varma",
      image: "https://images.unsplash.com/photo-1586282391129-59a998fd034c?w=800&auto=format&fit=crop"
    },
    {
      title: "Top Skills Companies Look For in Developers",
      excerpt: "Beyond coding, what makes a developer truly valuable? We explore the top hard and soft skills in high demand this year.",
      category: "Market Trends",
      date: "Mar 05, 2026",
      author: "Sneha Patel",
      image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop"
    }
  ];

  return (
    <PageLayout 
      title="Career" 
      gradientText="Insights" 
      subtitle="Discover the latest tips, guides and news to help you navigate your professional journey."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {posts.map((post, idx) => (
          <BlogCard key={idx} {...post} />
        ))}
      </div>
      
      <div className="mt-20 flex justify-center">
        <button className="px-8 py-4 rounded-xl font-bold bg-white text-slate-900 border border-slate-200 hover:border-primary hover:text-primary transition-all shadow-sm">
          Load More Articles
        </button>
      </div>
    </PageLayout>
  );
};

export default Blog;
