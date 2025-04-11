import mongoose from "mongoose";
import { Schema } from "mongoose";

const OrderSchema = new Schema({
  name: String,
  phone: String,
  address: String,
  city: String,
  pincode: String,

  cartItems: [
    {
      name: String,
      price: Number, // total price for this item (unit or weight based)
      qty: Number,   // for fixed items like burgers
      weight: {
        type:String,
         required:false
        }
    },
  ],

  total: Number,
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },
  paymentId: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Order", OrderSchema);