const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['video', 'pdf'],
    default: 'video'
  },
  content: {
    videoUrl: String,
    pdfUrl: String
  },
  order: {
    type: Number,
    required: true
  }
}, { _id: true });

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  order: {
    type: Number,
    required: true
  },
  lessons: [lessonSchema]
}, { _id: true });

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  skills: [{
    type: String,
    trim: true
  }],
  modules: [moduleSchema],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  totalStudents: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate slug before saving
courseSchema.pre('save', function (next) {
  if (!this.slug || this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-');
  }
  next();
});

// Calculate total lessons and duration
courseSchema.pre('save', function (next) {
  this.totalLessons = this.modules.reduce((total, module) => total + module.lessons.length, 0);
  this.totalDuration = this.modules.reduce((total, module) => {
    return total + module.lessons.reduce((moduleTotal, lesson) => moduleTotal + (lesson.duration || 0), 0);
  }, 0);
  next();
});

// Method to get course progress for a user
courseSchema.methods.getUserProgress = function (userId) {
  const user = this.enrolledStudents.find(id => id.toString() === userId.toString());
  if (!user) return null;

  const totalLessons = this.totalLessons;
  const completedLessons = user.completedLessons ? user.completedLessons.length : 0;
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return {
    enrolled: true,
    progress,
    completedLessons,
    totalLessons
  };
};

// Method to check if user is enrolled
courseSchema.methods.isEnrolled = function (userId) {
  return this.enrolledStudents.some(id => id.toString() === userId.toString());
};

// Method to add student to course
courseSchema.methods.addStudent = async function (userId) {
  if (!this.isEnrolled(userId)) {
    this.enrolledStudents.push(userId);
    this.totalStudents += 1;
    await this.save();
  }
};

// Method to remove student from course
courseSchema.methods.removeStudent = async function (userId) {
  const index = this.enrolledStudents.indexOf(userId);
  if (index > -1) {
    this.enrolledStudents.splice(index, 1);
    this.totalStudents = Math.max(0, this.totalStudents - 1);
    await this.save();
  }
};

// Add text index for search
courseSchema.index({ title: 'text', description: 'text' });

const Course = mongoose.model('Course', courseSchema);
module.exports = Course; 