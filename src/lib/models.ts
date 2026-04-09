import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['manager'], default: 'manager' },
});

const TransactionSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  paymentProof: { type: String },
  status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
