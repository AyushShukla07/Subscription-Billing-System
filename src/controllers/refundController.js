import stripe from '../config/stripe.js';
import Payment from '../models/Payment.js';

export const refundPayment = async (req, res) => {
    try {
        const { paymentId } = req.body;

        const payment = await Payment.findById(paymentId);
        if (!payment)
            return res.status(404).json({ message: "Payment not found" });

        if (payment.status === "refunded")
            return res.status(400).json({ message: "Already refunded" });

        const refund = await stripe.refunds.create({
            payment_intent: payment.stripePaymentIntentId
        });

        payment.status = "refunded";
        await payment.save();

        res.json({
            message: "Refund successful",
            refundId: refund.id
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Refund failed" });
    }
}
