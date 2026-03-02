import mongoose, { Schema, Document, Types } from "mongoose";

export interface IComment {
  _id?: Types.ObjectId;
  rating: number;
  content: string;
  author: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPerfume extends Document {
  perfumeName: string;
  uri: string;
  price: number;
  concentration: string;
  description: string;
  ingredients: string;
  volume: number;
  targetAudience: string;
  comments: IComment[];
  brand: Types.ObjectId;
  isApproved: boolean;
  submittedBy?: Types.ObjectId;
}

const commentSchema = new Schema<IComment>(
  {
    rating: { type: Number, min: 1, max: 3, required: true },
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Members",
      required: true,
    },
  },
  { timestamps: true }
);

const perfumeSchema = new Schema<IPerfume>(
  {
    perfumeName: { type: String, required: true },
    uri: { type: String, required: true },
    price: { type: Number, required: true },
    concentration: { type: String, required: true },
    description: { type: String, required: true },
    ingredients: { type: String, required: true },
    volume: { type: Number, required: true },
    targetAudience: { type: String, required: true },
    comments: [commentSchema],
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brands",
      required: true,
    },
    isApproved: { type: Boolean, default: false },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Members",
      default: null,
    },
  },
  { timestamps: true }
);

const Perfume = mongoose.model<IPerfume>("Perfumes", perfumeSchema);
export default Perfume;
