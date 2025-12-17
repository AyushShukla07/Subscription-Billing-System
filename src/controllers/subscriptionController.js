import stripe from '../config/stripe.js';
import User from '../models/User.js';
import Plan from '../models/Plan.js';
import Payment from '../models/Payment.js';
import { sendInvoiceEmail } from '../utils/sendEmail.js';

export const createCheckoutSession = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { planId } = req.body;

        const user = await User.findById(userId);
        if (!user)
            return res.status(404).json({ message: 'User not found' });

        const plan = await Plan.findById(planId);
        if (!plan)
            return res.status(404).json({ message: "Plan not found" });

        //Creating Stripe Checkout Session

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            customer: user.stripeCustomerId,
            line_items: [
                {
                    price: plan.stripePriceId,
                    quantity: 1,
                },
            ],
            success_url: "http://localhost:3000/success",
            cancel_url: "http://localhost:3000/cancel",
            metadata: {
                userId: user._id.toString(),
                planId: plan._id.toString(),
            },
        });
        res.status(200).json({
            url: session.url,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const cancelSubscription = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user?.subscription?.stripeSubscriptionId) {
            return res.status(400).json({ message: "No active subscription" });
        }

        const subscription = await stripe.subscriptions.update(
            user.subscription.stripeSubscriptionId,
            { cancel_at_period_end: true }
        );

        user.subscription.status = "cancelled";
        user.subscription.endDate = new Date(subscription.current_period_end * 1000);
        await user.save();

        res.json({
            message: "Subscription will cancel at period end",
            endDate: user.subscription.endDate
        });
    } catch (error) {
        res.status(500).json({ message: "Cancellation failed" });
    }
};

export const changePlan = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user?.subscription?.stripeSubscriptionId) {
            return res.status(400).json({ message: "No active subscription" });
        }

        const { newPlanId } = req.body;
        const newPlan = await Plan.findById(newPlanId);
        if (!newPlan) return res.status(404).json({ message: "Plan not found" });

        const subscription = await stripe.subscriptions.retrieve(user.subscription.stripeSubscriptionId);

        const updated = await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
            cancel_at_period_end: false,
            proration_behavior: "create_prorations",
            items: [{
                id: subscription.items.data[0].id,
                price: newPlan.stripePriceId,
            }]
        });

        const latestInvoice = await stripe.invoices.retrieve(
            updated.latest_invoice
        );

        await Payment.create({
            userId: user._id,
            stripeInvoiceId: latestInvoice.id,
            stripePaymentIntentId: latestInvoice.pre_payment_credit_notes_amount,
            amount: latestInvoice.amount_paid / 100,
            currency: latestInvoice.currency,
            status: latestInvoice.status,
            invoicePdf: latestInvoice.invoice_pdf
        });

        await sendInvoiceEmail(
            user.email,
            latestInvoice.invoice_pdf
        );


        user.subscription.planId = newPlan._id.toString();
        await user.save();

        res.json({
            message: "Subscription updated successfully",
            subscription: updated
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Plan change failed" });
    }
};