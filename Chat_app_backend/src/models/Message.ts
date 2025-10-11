import mongoose, { Schema } from 'mongoose';
import { IMessage } from '../types';

const reactionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  emoji: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

const messageSchema = new Schema<IMessage>({
  chatId: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['text', 'image', 'document'],
    default: 'text'
  },
  mediaUrl: {
    type: String,
    default: null
  },
  edited: {
    type: Boolean,
    default: false
  },
  reactions: {
    type: [reactionSchema],
    default: []
  },
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better performance
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ replyTo: 1 });
messageSchema.index({ createdAt: -1 });

// Compound index for chat messages
messageSchema.index({ chatId: 1, createdAt: -1 });

// Instance method to add reaction
messageSchema.methods.addReaction = function(userId: string, emoji: string): boolean {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter((reaction: any) => 
    reaction.userId.toString() !== userId
  );
  
  // Add new reaction
  this.reactions.push({ userId, emoji });
  return true;
};

// Instance method to remove reaction
messageSchema.methods.removeReaction = function(userId: string, emoji?: string): boolean {
  if (emoji) {
    // Remove specific reaction
    this.reactions = this.reactions.filter((reaction: any) => 
      !(reaction.userId.toString() === userId && reaction.emoji === emoji)
    );
  } else {
    // Remove all reactions from this user
    this.reactions = this.reactions.filter((reaction: any) => 
      reaction.userId.toString() !== userId
    );
  }
  return true;
};

// Instance method to check if user has reacted
messageSchema.methods.hasReacted = function(userId: string, emoji?: string): boolean {
  if (emoji) {
    return this.reactions.some((reaction: any) => 
      reaction.userId.toString() === userId && reaction.emoji === emoji
    );
  } else {
    return this.reactions.some((reaction: any) => 
      reaction.userId.toString() === userId
    );
  }
};

// Static method to get chat messages with pagination
messageSchema.statics.getChatMessages = function(
  chatId: string, 
  page: number = 1, 
  limit: number = 50
) {
  const skip = (page - 1) * limit;
  
  return this.find({ chatId })
    .populate('senderId', 'name username avatar')
    .populate('replyTo', 'content senderId')
    .populate('replyTo.senderId', 'name username avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get message count for chat
messageSchema.statics.getChatMessageCount = function(chatId: string) {
  return this.countDocuments({ chatId });
};

// Static method to search messages in chat
messageSchema.statics.searchMessages = function(
  chatId: string, 
  query: string, 
  page: number = 1, 
  limit: number = 20
) {
  const skip = (page - 1) * limit;
  const searchRegex = new RegExp(query, 'i');
  
  return this.find({
    chatId,
    content: searchRegex
  })
    .populate('senderId', 'name username avatar')
    .populate('replyTo', 'content senderId')
    .populate('replyTo.senderId', 'name username avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get recent messages for multiple chats
messageSchema.statics.getRecentMessages = function(chatIds: string[], limit: number = 10) {
  return this.aggregate([
    { $match: { chatId: { $in: chatIds } } },
    { $sort: { chatId: 1, createdAt: -1 } },
    {
      $group: {
        _id: '$chatId',
        lastMessage: { $first: '$$ROOT' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'lastMessage.senderId',
        foreignField: '_id',
        as: 'sender'
      }
    },
    {
      $lookup: {
        from: 'messages',
        localField: 'lastMessage.replyTo',
        foreignField: '_id',
        as: 'replyTo'
      }
    },
    {
      $project: {
        chatId: '$_id',
        lastMessage: {
          $mergeObjects: [
            '$lastMessage',
            {
              sender: { $arrayElemAt: ['$sender', 0] },
              replyTo: { $arrayElemAt: ['$replyTo', 0] }
            }
          ]
        }
      }
    }
  ]);
};

// Pre-save middleware to update chat's lastMessage
messageSchema.post('save', async function() {
  try {
    await mongoose.model('Chat').findByIdAndUpdate(
      this.chatId,
      { 
        lastMessage: this._id,
        updatedAt: new Date()
      }
    );
  } catch (error) {
    console.error('Error updating chat lastMessage:', error);
  }
});

// Pre-remove middleware to handle lastMessage cleanup
messageSchema.pre('deleteOne', { document: true, query: false }, async function() {
  try {
    const chat = await mongoose.model('Chat').findById(this.chatId);
    if (chat && chat.lastMessage?.toString() === this._id.toString()) {
      // Find the most recent message in this chat
      const lastMessage = await mongoose.model('Message')
        .findOne({ chatId: this.chatId, _id: { $ne: this._id } })
        .sort({ createdAt: -1 });
      
      await mongoose.model('Chat').findByIdAndUpdate(
        this.chatId,
        { 
          lastMessage: lastMessage?._id || null,
          updatedAt: new Date()
        }
      );
    }
  } catch (error) {
    console.error('Error handling lastMessage cleanup:', error);
  }
});

export const Message = mongoose.model<IMessage>('Message', messageSchema);
