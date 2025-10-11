import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

const socialLinkSchema = new Schema({
  platform: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

const userSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  avatar: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['online', 'away', 'offline'],
    default: 'offline'
  },
  statusMessage: {
    type: String,
    trim: true,
    maxlength: 200,
    default: null
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: null
  },
  banner: {
    type: String,
    default: null
  },
  socialLinks: {
    type: [socialLinkSchema],
    default: []
  },
  lastSeen: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better performance
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ status: 1 });
userSchema.index({ lastSeen: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Update lastSeen when status changes to online
userSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'online') {
    this.lastSeen = new Date();
  }
  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get public profile
userSchema.methods.toPublicJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Static method to find user by username or email
userSchema.statics.findByUsernameOrEmail = function(identifier: string) {
  return this.findOne({
    $or: [
      { username: identifier },
      { email: identifier }
    ]
  });
};

// Static method to get online users
userSchema.statics.getOnlineUsers = function() {
  return this.find({ status: 'online' }).select('-password -__v');
};

// Static method to search users
userSchema.statics.searchUsers = function(query: string, excludeIds: string[] = []) {
  const searchRegex = new RegExp(query, 'i');
  return this.find({
    _id: { $nin: excludeIds },
    $or: [
      { name: searchRegex },
      { username: searchRegex }
    ]
  }).select('-password -__v').limit(20);
};

export const User = mongoose.model<IUser>('User', userSchema);
