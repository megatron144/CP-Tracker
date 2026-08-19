const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const platformSchema = new mongoose.Schema({
  platform: {
    type: String,
    enum: ['leetcode', 'codeforces', 'codechef', 'geeksforgeeks', 'github', 'atcoder', 'linkedin'],
    required: true
  },
  handle: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified'],
    default: 'pending'
  },
  verificationCode: {
    type: String,
    required: true
  },
  verifiedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  platforms: [platformSchema]
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
