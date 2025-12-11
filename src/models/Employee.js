import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    age: { type: Number, required: true, index: true },
    class: { type: String },
    subjects: { type: [String], default: [] },
    attendance: { type: Number, required: true, index: true },
    role: { type: String, required: true, enum: ['admin', 'employee'], index: true },
    avatar: { type: String },
    date: { type: Date, required: true },
    email: { type: String, required: true, unique: true, index: true },
    flagged: { type: Boolean, default: false },
    passwordHash: { type: String },
  },
  { timestamps: true }
);

// Suggested indexes for performance
employeeSchema.index({ name: 1 });
employeeSchema.index({ role: 1 });
employeeSchema.index({ age: 1 });
employeeSchema.index({ attendance: 1 });

export default mongoose.models.Employee || mongoose.model('Employee', employeeSchema);