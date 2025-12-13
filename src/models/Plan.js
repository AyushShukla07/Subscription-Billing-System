import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    interval: {
        type: String,
        enum: ["month", "yaar"],
        default: "month",
    },
    stripePriceId: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model("Plan", planSchema);