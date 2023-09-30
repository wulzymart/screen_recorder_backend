import { connect } from 'mongoose';

export const connectDB = async (uri) => {
  return await connect(uri);
};
