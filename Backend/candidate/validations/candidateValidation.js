const { body } = require('express-validator');

exports.updateProfileValidation = [
  body('professionalHeadline').optional().trim().isLength({ max: 200 }),
  body('summary').optional().trim().isLength({ max: 2000 }),
  body('location').optional().trim(),
  body('phone').optional().trim(),
  body('noticePeriod').optional().trim(),
  body('portfolioUrl').optional().trim(),
  body('socialLinks.linkedin').optional().trim(),
  body('socialLinks.github').optional().trim(),
  body('skills').optional().isArray()
];

exports.educationValidation = [
  body('school').notEmpty().withMessage('School / University is required').trim(),
  body('degree').notEmpty().withMessage('Degree is required').trim(),
  body('fieldOfStudy').notEmpty().withMessage('Field of study is required').trim(),
  body('startDate').notEmpty().isISO8601().toDate(),
  body('endDate').optional({ checkFalsy: true }).isISO8601().toDate(),
  body('grade').optional({ checkFalsy: true }).trim(),
  body('description').optional({ checkFalsy: true }).trim()
];

exports.experienceValidation = [
  body('companyName').notEmpty().withMessage('Company is required').trim(),
  body('jobTitle').notEmpty().withMessage('Job title is required').trim(),
  body('employmentType').optional().isIn(['Full-time', 'Part-time', 'Self-employed', 'Freelance', 'Contract', 'Internship', 'Apprenticeship', 'Seasonal']),
  body('startDate').notEmpty().withMessage('Start date is required').isISO8601().toDate(),
  body('endDate').optional({ checkFalsy: true }).isISO8601().toDate(),
  body('currentlyWorking').optional().isBoolean(),
  body('description').optional({ checkFalsy: true }).trim(),
  body('keyAchievements').optional({ checkFalsy: true }).trim()
];

exports.projectValidation = [
    body('projectName').notEmpty().withMessage('Project name is required').trim(),
    body('description').optional({ checkFalsy: true }).trim(),
    body('technologiesUsed').optional().isArray(),
    body('githubLink').optional({ checkFalsy: true }).trim(),
    body('liveUrl').optional({ checkFalsy: true }).trim()
];
