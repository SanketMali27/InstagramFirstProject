import mongoose from 'mongoose';

const storySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    mediaUrl: {
      type: String,
      required: true
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    viewers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        viewedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

storySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const Story = mongoose.model('Story', storySchema);

export default Story;
