import mongoose from "mongoose";
import {Schema} from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number,
        required: true,
        match: [/^[0-9]{10}$/, "Please enter a valid phone number"],

    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    pincode: {
        type: Number,
        required: true,
        match: [/^[0-9]{6}$/, "Please enter a valid pincode"]
    }
});
const User = mongoose.model('User', userSchema);
export default User;