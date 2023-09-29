import { model, Schema } from 'mongoose';

const transCriptSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  videoId: {
    type: Schema.Types.ObjectId,
    ref: 'Video',
    required: true,
  },
});

export default model('Transcript', transCriptSchema);
