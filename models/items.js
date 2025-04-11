import mongoose from "mongoose";
const { Schema } = mongoose;

const itemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number, // Used for single-price items like banana
        required: false
    },
    Image: {
        type: String,
        required: false
    },
    category: {
        type: String,
        required: true
    },
    tag: {
        type: String,
        required: false
    },
    weights: [
        {
            value: {
                type: String,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }
    ]
});

const Item = mongoose.model('Item', itemSchema);
export default Item;



    // id: 'oliga-normal',
    // name: 'Chenikkaya Oliga',
    // image: 'oliga.webp',
    // price: 30,
    // category: 'oliga',
    // tag: 'best-seller'

    // weights: [
    //     { value: '100g', price: 140 },
    //     { value: '250g', price: 249 },
    //     { value: '500g', price: 499 },
    //     { value: '1kg', price: 999 }
    //   ]