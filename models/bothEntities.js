import { model, Schema } from 'mongoose';

const entrySchema = new Schema({
  created: {
    type: Boolean,
    default: false,
  },
  transciptId: {
    type: Schema.Types.ObjectId,
    ref: 'Transcript',
  },
  videoId: {
    type: Schema.Types.ObjectId,
    ref: 'Video',
  },
});

export default model('Entry', entrySchema);
