const mongoose = require('mongoose');

// Delete the existing model to force a refresh
if (mongoose.models.Todo) {
  delete mongoose.models.Todo;
}

const TodoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the task'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  completed: {
    type: Boolean,
    default: false
  },
  user: {
    // Use mixed type to accept any type of ID
    type: mongoose.Schema.Types.Mixed,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add a pre-save hook to ensure user is always a string
TodoSchema.pre('save', function(next) {
  if (this.user && typeof this.user !== 'string') {
    this.user = this.user.toString();
  }
  next();
});

// Add pre-find hooks to handle string IDs in queries
TodoSchema.pre('find', function() {
  const query = this.getQuery();
  if (query.user && mongoose.Types.ObjectId.isValid(query.user)) {
    // If it's a valid ObjectId, keep it as is
  } else if (query.user) {
    // If it's not a valid ObjectId, ensure it's treated as a string
    query.user = String(query.user);
  }
});

TodoSchema.pre('findOne', function() {
  const query = this.getQuery();
  if (query.user && mongoose.Types.ObjectId.isValid(query.user)) {
    // If it's a valid ObjectId, keep it as is
  } else if (query.user) {
    // If it's not a valid ObjectId, ensure it's treated as a string
    query.user = String(query.user);
  }
});

TodoSchema.pre('findOneAndUpdate', function() {
  const query = this.getQuery();
  if (query.user && mongoose.Types.ObjectId.isValid(query.user)) {
    // If it's a valid ObjectId, keep it as is
  } else if (query.user) {
    // If it's not a valid ObjectId, ensure it's treated as a string
    query.user = String(query.user);
  }
});

TodoSchema.pre('findOneAndDelete', function() {
  const query = this.getQuery();
  if (query.user && mongoose.Types.ObjectId.isValid(query.user)) {
    // If it's a valid ObjectId, keep it as is
  } else if (query.user) {
    // If it's not a valid ObjectId, ensure it's treated as a string
    query.user = String(query.user);
  }
});

module.exports = mongoose.model('Todo', TodoSchema); 