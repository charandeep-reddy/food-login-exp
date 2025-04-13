import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import Razorpay from "razorpay";
import user from "../models/users.js";
import items from "../models/items.js";
import orders from "../models/orders.js";

const app = express();
app.use(express.json());
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "..", "public")));

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.log("Error connecting to MongoDB", err);
    process.exit(1);
  }
}

connectDB();

//index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

//user-info
/*
name
phone number
address
city
pinCode
*/

app.post("/user-info", async (req, res) => {
  // Handle user info submission
  const { name, phoneNumber, address, city, pinCode } = req.body;
  const userInfo = await user.create({
    name,
    phoneNumber,
    address,
    city,
    pinCode,
  });
  res
    .status(200)
    .json({ message: "User info submitted successfully", userInfo });
});

//cart
app.get("/checkout", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "checkout.html"));
});

//render checkout page
/* 
app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'checkout.html'));
}
*/

//checkout
app.post("/checkout", async (req, res) => {
  const { name, phoneNumber, address, city, pinCode } = req.body;
  //payment
  //wait till payment success

  //if payment fails
  //go to checkout and try again

  //if payment success
  const userInfo = await user.create({
    name,
    phoneNumber,
    address,
    city,
    pinCode,
    //order-details
  });
  //send order confirmation to user
  //send order confirmation to admin
  //send order details to admin

  // For example, save order details to the database
  res.status(200).json({
    message: "Checkout successful",
    name,
    phoneNumber,
    address,
    city,
    pinCode,
  });
});

//place-order
app.post("/place-order", async (req, res) => {
  const { name, phone, address, city, pincode, cartItems, total } = req.body;
  const order = await orders.create({
    name,
    phone,
    address,
    city,
    pincode,
    cartItems,
    total,
  });
  res.status(200).json({ message: "Order placed successfully", order });
});

app.get("/orders", async (req, res) => {
  const ordersList = await orders.find({});
  res.status(200).json({ message: "Orders fetched successfully", ordersList });
});
//products

//find-products-by-category

//payment

//orders

//admin-login
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;

  // Check if the username and password are correct
  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    res.status(200).json({ message: "Login successful" });
    // res.redirect('/admin-dashboard');
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// Admin login page
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "admin-login.html"));
});

// Admin authentication
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    res.status(200).json({ message: "Login successful" });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// Get all orders
app.get("/api/orders", async (req, res) => {
  try {
    const allOrders = await orders.find().sort({ createdAt: -1 });
    res.json(allOrders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: error.message });
  }
});

// Delete order
app.delete("/api/orders/:id", async (req, res) => {
  try {
    await orders.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting order", error: error.message });
  }
});

//admin-dashboard
app.get("/admin-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "admin-dashboard.html"));
});

//add-items
app.post("/add-items", async (req, res) => {
  const { name, price, image, category, tag, weights } = req.body;
  const itemInfo = await items.create({
    name,
    price,
    image,
    category,
    tag,
    weights,
  });
  res.status(200).json({
    message: "Item added successfully",
    name,
    price,
    image,
    category,
    tag,
    weights,
  });
});

// Create Razorpay order
app.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: "order_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Verify payment
app.post("/verify-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = req.body;

    // Verify signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      // Payment is successful, save order
      const order = await orders.create({
        ...orderData,
        paymentStatus: "paid",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
      });

      res.json({
        success: true,
        message: "Payment verified successfully",
        order,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

export default app;
