const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  platformName: {
    type: String,
    default: 'JobYatra'
  },
  supportEmail: {
    type: String,
    default: 'support@jobyatra.com'
  },
  platformDescription: {
    type: String,
    default: 'Connecting top talent with the best opportunities.'
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  featuredJobPrice: {
    type: Number,
    default: 99
  },
  // Security & Auth
  sessionTimeout: {
    type: Number,
    default: 24 // hours
  },
  passwordMinLength: {
    type: Number,
    default: 6
  },
  allowRegistration: {
    type: Boolean,
    default: true
  },
  showAnalyticsPublicly: {
    type: Boolean,
    default: false
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// We only want ONE settings document for the platform
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
