import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  uid: string;
  name?: string;
  email: string;
  password?: string;
  isPremium: boolean;
  subscriptionPlan: string;
  subscriptionStatus: string;
  renewalDate?: string;
  paymentHistory?: any[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    uid: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "" },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    isPremium: { type: Boolean, default: false },
    subscriptionPlan: { type: String, default: "free" },
    subscriptionStatus: { type: String, default: "active" },
    renewalDate: { type: String, default: "" },
    paymentHistory: { type: Array, default: [] },
  },
  { timestamps: true, bufferCommands: false, bufferTimeoutMS: 2000 }
);

export interface IDocumentActivity extends Document {
  userId: string;
  toolUsed: string;
  fileName?: string;
  fileSize?: string | number;
  pageCount?: number;
  status: string;
  createdAt: Date;
}

const DocumentActivitySchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    toolUsed: { type: String, required: true },
    fileName: { type: String, default: "" },
    fileSize: { type: Schema.Types.Mixed, default: "" },
    pageCount: { type: Number, default: 1 },
    status: { type: String, default: "completed" },
  },
  { timestamps: true, bufferCommands: false, bufferTimeoutMS: 2000 }
);

export interface IReview extends Document {
  name: string;
  role: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: "User" },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true, bufferCommands: false, bufferTimeoutMS: 2000 }
);

export const UserModel: any = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export const DocumentActivityModel: any = mongoose.models.DocumentActivity || mongoose.model<IDocumentActivity>("DocumentActivity", DocumentActivitySchema);
export const ReviewModel: any = mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
