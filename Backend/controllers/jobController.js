const Job = require('../models/Job');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res, next) => {
  try {
    let query;
    const reqQuery = { ...req.query };

    // Fields to exclude from direct string matching
    const removeFields = ['select', 'sort', 'page', 'limit', 'search', 'skills', 'remote', 'salary', 'experience', 'location', 'type'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Handle Status (default to Active)
    let queryObj = { ...reqQuery, status: 'Active' };

    // Handle Search (Title or Company)
    if (req.query.search && req.query.search.trim() !== '') {
      queryObj.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { company: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Handle Location (Case-insensitive)
    if (req.query.location && req.query.location.trim() !== '') {
      queryObj.location = { $regex: req.query.location, $options: 'i' };
    }

    // Handle Job Type (Multiple)
    if (req.query.type && req.query.type.trim() !== '') {
      queryObj.type = { $in: req.query.type.split(',') };
    }

    // Handle Skills (intersection)
    if (req.query.skills && req.query.skills.trim() !== '') {
      const skillsArray = req.query.skills.split(',');
      queryObj.skills = { $all: skillsArray };
    }

    // Handle Remote
    if (req.query.remote === 'true') {
      queryObj.isRemote = true;
    }

    // Handle Salary (Minimum LPA) - Use numeric field salaryValue
    if (req.query.salary) {
      queryObj.salaryValue = { $gte: parseInt(req.query.salary) };
    }

    // Handle Experience - Only filter if NOT 'Any'
    if (req.query.experience && req.query.experience !== 'Any') {
      queryObj.experience = req.query.experience;
    }

    // console.log('[DEBUG] Final Backend Query Object:', JSON.stringify(queryObj, null, 2));

    query = Job.find(queryObj);

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort === 'salary' ? '-salaryValue' : '-postedDate';
      query = query.sort(sortBy);
    } else {
      query = query.sort('-postedDate');
    }

    // Limit
    const limit = parseInt(req.query.limit, 10) || 0;
    if (limit > 0) {
      query = query.limit(limit);
    }

    const jobs = await query;

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Recruiter/Admin)
exports.createJob = async (req, res, next) => {
  try {
    // Debugging: Log incoming request body and user
    // console.log('[DEBUG] Job Creation Request Body:', {
    //   ...req.body,
    //   logo: req.body.logo ? `${req.body.logo.substring(0, 50)}... [Base64-Data]` : 'No Logo'
    // });
    // console.log('[DEBUG] Authenticated User ID:', req.user.id);

    // Add user to req.body
    req.body.recruiter = req.user.id;

    // Validate required fields explicitly for better error messages
    const requiredFields = ['title', 'company', 'location', 'salaryValue', 'experience', 'type', 'description'];
    const missingFields = requiredFields.filter(f => !req.body[f]);

    if (missingFields.length > 0) {
      console.warn('[DEBUG] Missing Required Fields:', missingFields);
      return next(new ErrorResponse(`Missing required fields: ${missingFields.join(', ')}`, 400));
    }

    const job = await Job.create(req.body);

    // console.log('[DEBUG] Job successfully created in database:', job._id);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job: job
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(val => val.message);
      console.error('[DEBUG] Mongoose Validation Error:', message);
      return next(new ErrorResponse(message.join(', '), 400));
    }
    console.error('[DEBUG] Database Error during Job Creation:', err.message);
    next(err);
  }
};

// @desc    Get jobs by current recruiter
// @route   GET /api/jobs/recruiter/my-jobs
// @access  Private (Recruiter)
exports.getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.aggregate([
      { $match: { recruiter: req.user._id } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'jobapplications',
          localField: '_id',
          foreignField: 'jobId',
          as: 'applications'
        }
      },
      {
        $addFields: {
          applicants: { $size: '$applications' }
        }
      },
      {
        $project: {
          applications: 0 // Remove the full array to keep response small
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (err) {
    next(err);
  }
};
// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter/Admin)
exports.updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is recruiter of the job
    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User not authorized to update this job`, 401));
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter/Admin)
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return next(new ErrorResponse(`Job not found with id of ${req.params.id}`, 404));
    }

    // Make sure user is recruiter of the job
    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`User not authorized to delete this job`, 401));
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
