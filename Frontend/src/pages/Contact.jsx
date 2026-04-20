import React, { useState } from 'react';
import PageLayout from '../components/PageLayout';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    // Email format validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.submitContactForm(formData);
      if (response.success) {
        toast.success(response.message || 'Message sent successfully!');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      }
    } catch (error) {
      console.error('Contact Form Error:', error);
      toast.error(error.toString() || 'Failed to send message. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout 
      title="Get in" 
      gradientText="touch" 
      subtitle="Have questions or feedback? We'd love to hear from you. Our team is here to help."
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
        {/* Contact Info */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center lg:text-left tracking-tight">Contact Information</h2>
            <p className="text-slate-600 mb-10 text-center lg:text-left leading-relaxed">
              Fill out the form and our team will get back to you within 24 hours.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-6 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Mail size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Email Us</p>
                <p className="text-lg font-bold text-slate-800">support@jobyatra.com</p>
              </div>
            </div>

            <div className="flex items-center gap-6 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <Phone size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Call Us</p>
                <p className="text-lg font-bold text-slate-800">+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="flex items-center gap-6 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Our Headquarters</p>
                <p className="text-lg font-bold text-slate-800">Mumbai, India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-3">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100"
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    disabled={isLoading}
                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    disabled={isLoading}
                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Subject</label>
                <input 
                  type="text" 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  disabled={isLoading}
                  className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 ml-1">Message</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5" 
                  placeholder="Your message here..."
                  disabled={isLoading}
                  className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none disabled:opacity-70 disabled:cursor-not-allowed"
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full gradient-btn py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Contact;

