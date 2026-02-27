import mongoose, { Schema, Document, CallbackWithoutResultAndOptionalError } from "mongoose";
import bcrypt from "bcrypt";

export interface IMember extends Document {
  email: string;
  password: string;
  name: string;
  YOB: number;
  gender: boolean;
  isAdmin: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const memberSchema = new Schema<IMember>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    YOB: { type: Number, required: true },
    gender: { type: Boolean, default: true },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Hash password before saving
memberSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

memberSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
memberSchema.set("toJSON", {
  transform: (_doc: any, ret: any) => {
    ret.password = undefined;
    return ret;
  },
});

const Member = mongoose.model<IMember>("Members", memberSchema);
export default Member;
