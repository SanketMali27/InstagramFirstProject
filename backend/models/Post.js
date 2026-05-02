import mongoose from 'mongoose';

const replySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    replies: [replySchema]
  },
  {
    timestamps: true
  }
);

const postSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      default: ''
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 2200,
      default: ''
    },
    location: {
      type: String,
      trim: true,
      default: ''
    },
    publicId: {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    comments: [commentSchema],
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true
      }
    ],
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      default: 'image'
    },
    videoUrl: {
      type: String,
      default: ''
    },
    thumbnailUrl: {
      type: String,
      default: ''
    },
    duration: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

postSchema.index({ tags: 1 });

const Post = mongoose.model('Post', postSchema);

export default Post;
