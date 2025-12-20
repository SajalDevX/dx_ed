import mongoose, { Document, Schema } from 'mongoose';

export interface IGenerationRecord {
  prompt: string;
  content: string;
  createdAt: Date;
}

export interface IAIGeneration extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  date: Date; // Date for tracking daily limit (stored as start of day)
  generationsUsed: number;
  generations: IGenerationRecord[];
  createdAt: Date;
  updatedAt: Date;
}

const generationRecordSchema = new Schema<IGenerationRecord>({
  prompt: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const aiGenerationSchema = new Schema<IAIGeneration>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    generationsUsed: {
      type: Number,
      default: 0,
      required: true,
    },
    generations: [generationRecordSchema],
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient daily usage queries
aiGenerationSchema.index({ user: 1, course: 1, date: 1 }, { unique: true });

const AIGeneration = mongoose.model<IAIGeneration>('AIGeneration', aiGenerationSchema);

export default AIGeneration;
