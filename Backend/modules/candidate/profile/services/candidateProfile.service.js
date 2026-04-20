/**
 * Calculate the completion percentage of a candidate's profile.
 * @param {Object} profile - The candidate profile object with populated virtuals.
 * @returns {Number} - The completion percentage (0-100).
 */
const calculateCompletionPercentage = (profile) => {
    if (!profile) return 0;

    const weights = {
        basicInfo: 20, // Full Name, Email, Headline, Job Title, Location, Phone
        summary: 10,
        education: 15,
        experience: 20,
        skills: 15,
        certifications: 5,
        projects: 10,
        resumes: 5
    };

    let score = 0;

    // Basic Info Check (Approximate)
    if (profile.fullName && profile.email && profile.professionalHeadline && profile.location) {
        score += weights.basicInfo;
    } else if (profile.fullName && profile.email) {
        score += weights.basicInfo / 2;
    }

    // Summary Check
    if (profile.summary && profile.summary.length > 50) {
        score += weights.summary;
    }

    // Education Check (Virtual)
    if (profile.education && profile.education.length > 0) {
        score += weights.education;
    }

    // Experience Check (Virtual)
    if (profile.experience && profile.experience.length > 0) {
        score += weights.experience;
    }

    // Skills Check (Virtual)
    if (profile.skills && profile.skills.length > 0) {
        score += weights.skills;
    }

    // Certifications Check (Virtual)
    if (profile.certifications && profile.certifications.length > 0) {
        score += weights.certifications;
    }

    // Projects Check (Virtual)
    if (profile.projects && profile.projects.length > 0) {
        score += weights.projects;
    }

    // Resumes Check (Virtual)
    if (profile.resumes && profile.resumes.length > 0) {
        score += weights.resumes;
    }

    return Math.min(score, 100);
};

module.exports = {
    calculateCompletionPercentage
};
