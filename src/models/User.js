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
        planId: String,
        status: {
            type: String,
            enum: ["active", "past_due", "cancelled", "expired"],
            default: "active"
        },
        startDate: Date,
        endDate: Date,
        stripeSubscriptionId: String,
        gracePeriodEnd: Date
    }
}, { timestamps: true });

export default mongoose.model("User", userSchema);