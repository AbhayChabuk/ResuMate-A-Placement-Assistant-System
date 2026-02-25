const mongoose = require('mongoose');

const roadmapItemSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    resources: {
      type: [
        {
          label: { type: String, required: true, trim: true },
          url: { type: String, required: true, trim: true },
        },
      ],
      default: [],
    },
  },
  { _id: false }
);

const roadmapSectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    items: { type: [roadmapItemSchema], default: [] },
  },
  { _id: false }
);

const placementRoadmapSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    domain: { type: String, required: true, trim: true },
    sections: { type: [roadmapSectionSchema], default: [] },
  },
  { timestamps: true }
);

placementRoadmapSchema.index({ user: 1, domain: 1 }, { unique: true });

module.exports = mongoose.model('PlacementRoadmap', placementRoadmapSchema);

