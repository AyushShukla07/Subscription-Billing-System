import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    stripeInvoiceId: String,
    stripePaymentIntentId: String,

    amount: Number,
    currency: String,

    status: {
        type: String,
        enum: ["paid", "failed", "pending","refunded"],
        required: true
    },

    invoicePdf: String
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);