import stripe from "../config/stripe.js";
import User from "../models/User.js";

export const stripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("Webhook signature verification failed", err.message);
        return res.status(400).send(`Webhook error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;

                if (!session.metadata?.userId) {
                    console.log("Missing metadata in checkout session");
                    break;
                }

                const userId = session.metadata.userId;
                const planId = session.metadata.planId;
                const subscriptionId = session.subscription;

                await User.findByIdAndUpdate(userId, {
                    subscription: {
                        planId,
                        status: "active",
                        startDate: new Date(),
                        stripeSubscriptionId: subscriptionId
                    }
                });
                console.log("Subscription activated for user:", userId);
                break;
            }
            case "invoice.payment_failed": {
                const invoice = event.data.object;
                console.log('Payment Failed: ', invoice.customer);
                break;
            }
            case "customer.subscription.deleted": {
                const subscription = event.data.object;
                console.log('Subscription cancelled: ', subscription.id);
                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        res.json({ received: true });
    } catch (err) {
        console.error("Webhook handler error ", err);
        res.status(500).json({ message: "Webhook processing failed" });
    }
};