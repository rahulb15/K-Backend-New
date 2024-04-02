import mongoose from 'mongoose';
import { IUser } from '../interfaces/user/user.interface';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  password: { type: String, required: true, trim: true, minlength: 6 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;