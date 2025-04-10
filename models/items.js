import mongoose from "mongoose";
import {Schema} from "mongoose";

const itemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    Image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    }
});

const Item = mongoose.model('Item', itemSchema);
export default Item;