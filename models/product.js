import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter Name"],
  },
  description: {
    type: String,
    required: [true, "Please enter Description"],
  },
  price: {
    type: Number,
    required: [true, "Please enter Price"],
  },
  stock: {
    type: Number,
    required: [true, "Please enter stock"],
  },
  images: [{ public_id: String, url: String }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Product = mongoose.model("Product", schema);
