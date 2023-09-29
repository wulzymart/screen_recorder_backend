import { model, Schema } from 'mongoose';

const videoSchema = new Schema({
  fileId: {
    type: String,
    required: [true, 'enter a file id'],
    unique: true,
  },
  transciptId: {
    type: Schema.Types.ObjectId,
    ref: 'Transcript',
  },
});

export default model('Video', videoSchema);
