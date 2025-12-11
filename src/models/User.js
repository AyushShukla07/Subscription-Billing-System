import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    stripeCustomerId: {
        type: String,
        fefault: null,
    },
    subscription: {
        planId: { type: String, default: null },
        status: { type: String, default: "inactive" },
        startDate: { type: Date },
        endDate: { type: Date },
    }
}, { timestamps: true });

export default mongoose.model("User", userSchema);