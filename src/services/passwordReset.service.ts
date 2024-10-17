import mongoose from 'mongoose';
import crypto from 'crypto';

// Define the schema for password reset tokens
const passwordResetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // This will automatically delete the document after 1 hour
  }
});

// Create the model
const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);

export class PasswordResetTokenService {
  async createToken(userId: string): Promise<string> {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = new PasswordResetToken({
      userId,
      token: resetToken
    });
    await passwordResetToken.save();
    return resetToken;
  }

  async findToken(token: string): Promise<any> {
    return PasswordResetToken.findOne({ token });
  }

  async deleteToken(token: string): Promise<void> {
    await PasswordResetToken.deleteOne({ token });
  }
}

export default new PasswordResetTokenService();