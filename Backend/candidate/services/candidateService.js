/**
 * Calculate the completion percentage of a candidate's profile.
 * @param {Object} profile - The candidate profile object.
 * @returns {Number} - The completion percentage (0-100).
 */
/**
 * Calculate the completion percentage of a candidate's profile.
 * @param {Object} profile - The candidate profile object with virtuals.
 * @returns {Object} - { percentage: Number, missingSections: Array }
 */
const calculateCompletionPercentage = (profile) => {
  if (!profile) return { percentage: 0, missingSections: [] };

  const sections = [
    { label: 'Profile Photo', key: 'profilePhoto', weight: 5, check: (p) => !!p.profilePhoto },
    { label: 'Professional Headline', key: 'professionalHeadline', weight: 5, check: (p) => !!p.professionalHeadline },
    { label: 'Phone Number', key: 'phone', weight: 5, check: (p) => !!p.phone },
    { label: 'Location', key: 'location', weight: 5, check: (p) => !!p.location },
    { label: 'Professional Summary', key: 'summary', weight: 15, check: (p) => !!p.summary },
    { label: 'Skills', key: 'skills', weight: 20, check: (p) => p.skills && p.skills.length > 0 },
    { label: 'Work Experience', key: 'experience', weight: 15, check: (p) => p.experience && p.experience.length > 0 },
    { label: 'Education', key: 'education', weight: 15, check: (p) => p.education && p.education.length > 0 },
    { label: 'Resume', key: 'resume', weight: 15, check: (p) => p.resume || (p.resumes && p.resumes.length > 0) }
  ];

  let score = 0;
  let missingSections = [];

  sections.forEach(section => {
    if (section.check(profile)) {
      score += section.weight;
    } else {
      missingSections.push({
        label: section.label,
        weight: section.weight,
        key: section.key
      });
    }
  });

  return {
    percentage: Math.min(score, 100),
    missingSections
  };
};

/**
 * Format candidate dashboard statistics.
 * @param {Array} applications - List of candidate applications.
 * @param {Array} savedJobs - List of saved jobs.
 * @returns {Object} - Formatted stats.
 */
const formatDashboardStats = (applications, savedJobs) => {
  const stats = [
    {
      name: 'Applied Jobs',
      value: applications.length.toString(),
      trend: `${applications.filter(a => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(a.createdAt) > weekAgo;
      }).length} this week`,
      trendColor: 'text-emerald-600'
    },
    {
      name: 'Saved Jobs',
      value: savedJobs.length.toString(),
      trend: 'Keep track of interests',
      trendColor: 'text-indigo-600'
    },
    {
      name: 'Interview Calls',
      value: applications.filter(a => a.status === 'Interview').length.toString(),
      trend: 'Get ready!',
      trendColor: 'text-emerald-600'
    }
  ];

  return stats;
};

module.exports = {
  calculateCompletionPercentage,
  formatDashboardStats
};
