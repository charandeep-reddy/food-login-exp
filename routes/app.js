import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import user from '../models/users.js';
import items from '../models/items.js';

const app = express();
app.use(express.json());
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname,"..", 'public')));


async function connectDB() {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB connected successfully");
    }catch(err){
        console.log("Error connecting to MongoDB", err);
        process.exit(1);
}}

connectDB()


//index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})


//user-info
/*
name
phone number
address
city
pinCode
*/

app.post('/user-info', async (req, res) => {
    // Handle user info submission
    const {name, phoneNumber, address, city, pinCode}= req.body;
    const userInfo = await user.create ({
        name,
        phoneNumber,
        address,
        city,
        pinCode
    });
    res.status(200).json({message: "User info submitted successfully", userInfo});
})

//cart

//render checkout page
/* 
app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'checkout.html'));
}
*/

//checkout
app.post('/checkout',async (req, res) => {
    const {name, phoneNumber, address, city, pinCode} = req.body;
    //payment
    //wait till payment success
    
    //if payment fails
    //go to checkout and try again

    //if payment success
    const userInfo = await user.create ({
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
    res.status(200).json({message: "Checkout successful", name, phoneNumber, address, city, pinCode});
})

//place-order

//products

//find-products-by-category

//payment

//orders

//admin-login
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;

    // Check if the username and password are correct
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        res.status(200).json({ message: 'Login successful' });
        // res.redirect('/admin-dashboard');
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
})

//admin-dashboard
app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
})

//add-items
app.post('/add-items', async (req, res) => {
    const { name, price, image, category, tag, weights } = req.body;
    const itemInfo = await items.create ({
        name,
        price,
        image,
        category,
        tag,
        weights
    });
    res.status(200).json({ message: "Item added successfully", name, price, image, category, tag, weights });
})




export default app