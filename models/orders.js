import mongoose from "mongoose";
import { Schema } from "mongoose";

const OrderSchema = new Schema({
  name: String,
  phone: {
    type: Number,
    required: true,
    match: [/^[0-9]{10}$/, "Please enter a valid phone number"],
  },
  address: String,
  city: String,
  pincode: {
    type: Number,
    required: true,
    match: [/^[0-9]{6}$/, "Please enter a valid pincode"],
  },

  cartItems: [
    {
      _id: false,
      name: String,
      price: Number, // total price for this item (unit or weight based)
      qty: Number, // for fixed items like burgers
      weight: {
        type: String,
        required: false,
      },
    },
  ],

  total: Number,
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  orderId: {
    type: String,
    unique: true,
  },
  paymentId: {
    type: String,
    unique: true,
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Order", OrderSchema);
