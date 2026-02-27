import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPost extends Document {
  title: string;
  content: string;
  image: string;
  author: Types.ObjectId;
  perfume?: Types.ObjectId;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    image: { type: String, default: "" },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Members",
      required: true,
    },
    perfume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Perfumes",
      default: null,
    },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

const Post = mongoose.model<IPost>("Posts", postSchema);
export default Post;
