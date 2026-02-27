import mongoose, { Schema, Document } from "mongoose";

export interface IBrand extends Document {
  brandName: string;
}

const brandSchema = new Schema<IBrand>(
  {
    brandName: { type: String, required: true },
  },
  { timestamps: true }
);

const Brand = mongoose.model<IBrand>("Brands", brandSchema);
export default Brand;
