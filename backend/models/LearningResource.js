const mongoose = require('mongoose');

const learningResourceSchema = new mongoose.Schema(
  {
    // e.g. "web", "data", "cloud", or "any" for global
    domain: { type: String, required: true, trim: true },
    // Topics/keywords this resource is relevant for, e.g. ["html", "css grid"]
    topics: { type: [String], default: [] },
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

learningResourceSchema.index({ domain: 1 });
learningResourceSchema.index({ topics: 1 });

module.exports = mongoose.model('LearningResource', learningResourceSchema);

