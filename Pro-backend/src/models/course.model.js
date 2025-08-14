import { Schema, model } from 'mongoose';

// Subchapter Schema
const subchapterSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    content: { type: String }, // Text content or HTML
    videoUrl: { type: String },
    duration: { type: Number }, // Duration in minutes
    resources: [
      {
        title: { type: String },
        url: { type: String },
        type: {
          type: String,
          enum: ['pdf', 'video', 'audio', 'document', 'link'],
        },
      },
    ],
    quiz: {
      questions: [
        {
          question: { type: String },
          options: [{ type: String }],
          correctAnswer: { type: Number }, // Index of correct option
          explanation: { type: String },
        },
      ],
    },
    assignments: [
      {
        title: { type: String },
        description: { type: String },
        dueDate: { type: Date },
        maxMarks: { type: Number },
      },
    ],
    order: { type: Number, default: 0 }, // For ordering subchapters
    isCompleted: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Chapter Schema
const chapterSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    thumbnail: { type: String }, // Thumbnail image URL
    subchapters: [subchapterSchema],
    order: { type: Number, default: 0 }, // For ordering chapters
    isPublished: { type: Boolean, default: false },
    estimatedDuration: { type: Number }, // Total estimated duration in minutes
  },
  { timestamps: true }
);

// Main Course Schema
let courseSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    shortDescription: { type: String }, // Brief summary for course cards
    thumbnail: { type: String }, // Course thumbnail image
    category: { type: String, required: true },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    language: { type: String, default: 'English' },
    price: { type: Number, default: 0 },
    discountPrice: { type: Number },
    currency: { type: String, default: 'INR' },

    // Tutor information
    tutor: {
      type: Schema.Types.ObjectId,
      ref: 'Tutor',
      required: true,
    },

    // Course structure
    chapters: [chapterSchema],

    // Course metadata
    tags: [{ type: String }],
    prerequisites: [{ type: String }],
    learningOutcomes: [{ type: String }],
    targetAudience: [{ type: String }],

    // Course stats
    totalDuration: { type: Number }, // Total duration in minutes
    totalChapters: { type: Number, default: 0 },
    totalSubchapters: { type: Number, default: 0 },
    enrollmentCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    // Course status
    isPublished: { type: Boolean, default: false },
    isDraft: { type: Boolean, default: true },
    publishedAt: { type: Date },

    // Additional features
    certificate: {
      isAvailable: { type: Boolean, default: false },
      template: { type: String },
      criteria: { type: String },
    },

    // Course settings
    allowComments: { type: Boolean, default: true },
    allowDownloads: { type: Boolean, default: false },
    autoEnroll: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Virtual for calculating total chapters
courseSchema.virtual('chapterCount').get(function () {
  return this.chapters.length;
});

// Virtual for calculating total subchapters
courseSchema.virtual('subchapterCount').get(function () {
  return this.chapters.reduce(
    (total, chapter) => total + chapter.subchapters.length,
    0
  );
});

// Pre-save middleware to update course statistics
courseSchema.pre('save', function (next) {
  // Update total chapters and subchapters
  this.totalChapters = this.chapters.length;
  this.totalSubchapters = this.chapters.reduce(
    (total, chapter) => total + chapter.subchapters.length,
    0
  );

  // Calculate total duration
  this.totalDuration = this.chapters.reduce((total, chapter) => {
    const chapterDuration = chapter.subchapters.reduce(
      (subTotal, subchapter) => {
        return subTotal + (subchapter.duration || 0);
      },
      0
    );
    return total + chapterDuration;
  }, 0);

  next();
});

// Instance methods
courseSchema.methods.addChapter = function (chapterData) {
  this.chapters.push(chapterData);
  return this.save();
};

courseSchema.methods.addSubchapter = function (chapterId, subchapterData) {
  const chapter = this.chapters.id(chapterId);
  if (chapter) {
    chapter.subchapters.push(subchapterData);
    return this.save();
  }
  throw new Error('Chapter not found');
};

courseSchema.methods.reorderChapters = function (chapterIds) {
  const reorderedChapters = chapterIds
    .map((id, index) => {
      const chapter = this.chapters.id(id);
      if (chapter) {
        chapter.order = index;
        return chapter;
      }
    })
    .filter(Boolean);

  this.chapters = reorderedChapters;
  return this.save();
};

courseSchema.methods.publish = function () {
  this.isPublished = true;
  this.isDraft = false;
  this.publishedAt = new Date();
  return this.save();
};

export default model('Course', courseSchema);
