import mongoose, { Schema } from 'mongoose';
import { IChat, IChatModel } from '../types';

const chatSchema = new Schema<IChat>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    enum: ['dm', 'group'],
    required: true
  },
  avatar: {
    type: String,
    default: null
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: null
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  admins: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  customBackground: {
    type: String,
    default: null
  },
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const { __v, ...chatWithoutVersion } = ret;
      return chatWithoutVersion;
    }
  }
});

// Indexes for better performance
chatSchema.index({ members: 1 });
chatSchema.index({ type: 1 });
chatSchema.index({ lastMessage: 1 });
chatSchema.index({ updatedAt: -1 });

// Compound index for finding user's chats
chatSchema.index({ members: 1, updatedAt: -1 });

// Pre-save middleware to set first member as admin for group chats
chatSchema.pre('save', function(next) {
  if (this.isNew && this.type === 'group' && this.members.length > 0 && this.admins.length === 0) {
    this.admins = [this.members[0]];
  }
  next();
});

// Instance method to check if user is member
chatSchema.methods.isMember = function(userId: string): boolean {
  return this.members.some((memberId: any) => memberId.toString() === userId);
};

// Instance method to check if user is admin
chatSchema.methods.isAdmin = function(userId: string): boolean {
  return this.admins.some((adminId: any) => adminId.toString() === userId);
};

// Instance method to add member
chatSchema.methods.addMember = function(userId: string): boolean {
  if (!this.isMember(userId)) {
    this.members.push(userId);
    return true;
  }
  return false;
};

// Instance method to remove member
chatSchema.methods.removeMember = function(userId: string): boolean {
  const memberIndex = this.members.findIndex((memberId: any) => memberId.toString() === userId);
  if (memberIndex !== -1) {
    this.members.splice(memberIndex, 1);
    // Remove from admins if they were admin
    const adminIndex = this.admins.findIndex((adminId: any) => adminId.toString() === userId);
    if (adminIndex !== -1) {
      this.admins.splice(adminIndex, 1);
    }
    return true;
  }
  return false;
};

// Instance method to promote to admin
chatSchema.methods.promoteToAdmin = function(userId: string): boolean {
  if (this.isMember(userId) && !this.isAdmin(userId)) {
    this.admins.push(userId);
    return true;
  }
  return false;
};

// Instance method to demote from admin
chatSchema.methods.demoteFromAdmin = function(userId: string): boolean {
  const adminIndex = this.admins.findIndex((adminId: any) => adminId.toString() === userId);
  if (adminIndex !== -1) {
    this.admins.splice(adminIndex, 1);
    return true;
  }
  return false;
};

// Static method to find user's chats
chatSchema.statics.findUserChats = function(userId: string) {
  return this.find({ members: userId })
    .populate('members', 'name username avatar status')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });
};

// Static method to find or create DM
chatSchema.statics.findOrCreateDM = async function(userId1: string, userId2: string) {
  // Check if DM already exists
  let dm = await this.findOne({
    type: 'dm',
    members: { $all: [userId1, userId2] }
  }).populate('members', 'name username avatar status');

  if (!dm) {
    // Create new DM
    const user1 = await mongoose.model('User').findById(userId1);
    const user2 = await mongoose.model('User').findById(userId2);
    
    if (!user1 || !user2) {
      throw new Error('One or both users not found');
    }

    dm = new this({
      name: `${user1.name} & ${user2.name}`,
      type: 'dm',
      members: [userId1, userId2]
    });

    await dm.save();
    await dm.populate('members', 'name username avatar status');
  }

  return dm;
};

// Static method to create group chat
chatSchema.statics.createGroupChat = async function(name: string, creatorId: string, memberIds: string[]) {
  const allMembers = [creatorId, ...memberIds];
  
  // Validate all members exist
  const users = await mongoose.model('User').find({ _id: { $in: allMembers } });
  if (users.length !== allMembers.length) {
    throw new Error('One or more users not found');
  }

  const groupChat = new this({
    name,
    type: 'group',
    members: allMembers,
    admins: [creatorId]
  });

  await groupChat.save();
  await groupChat.populate('members', 'name username avatar status');
  
  return groupChat;
};

export const Chat = mongoose.model<IChat, IChatModel>('Chat', chatSchema);
