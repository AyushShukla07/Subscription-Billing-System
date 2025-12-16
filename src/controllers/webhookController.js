import stripe from "../config/stripe.js";
import User from "../models/User.js";
import Payment from '../models/Payment.js';

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
            case "invoice.payment_succeeded":
            case "invoice.paid": {
                const invoice = event.data.object;

                const user = await User.findOne({
                    stripeCustomerId: invoice.customer
                });

                if (!user) break;

                let stripeChargeId = null;

                if (invoice.payment_intent) {
                    const paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent);
                    stripeChargeId = paymentIntent.latest_charge;
                }

                await Payment.create({
                    userId: user._id,
                    stripeInvoiceId: invoice.id,
                    stripePaymentIntentId: invoice.payment_intent || null,
                    stripeChargeId,
                    subscriptionId: invoice.subscription,
                    amount: invoice.amount_paid / 100,
                    currency: invoice.currency,
                    status: "paid",
                    invoicePdf: invoice.invoice_pdf,
                });

                console.log("Invoice Paid and Stored: ", invoice.id);
                break;
            }
            case "invoice.payment_failed": {
                const invoice = event.data.object;

                // const user = await User.findOne({ stripeCustomerId: invoice.customer, }); if (!user) break;

                // await Payment.create({
                //     userId: user._id,
                //     stripeInvoiceId: invoice.id,
                //     amount: invoice.amount_due / 100,
                //     currency: invoice.currency,
                //     status: "failed",
                // });

                await User.findOneAndUpdate(
                    {
                        stripeCustomerId: invoice.customer
                    },
                    {
                        "subscription.status": "past_due",
                        "subscription.gracePeriodEnd": new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                    }
                );

                console.log("Subscription in grace period");
                break;
            }
            case "customer.subscription.deleted": {
                const sub = event.data.object;

                await User.findOneAndUpdate(
                    {
                        "subscription.stripeSubscriptionId": sub.id
                    },
                    {
                        "subscription.status": "expired",
                        "subscription.endDate": new Date(sub.ended_at * 1000)
                    }
                );

                console.log('Subscription expired: ', sub.id);
                break;
            }
            case "charge.refunded": {
                const charge = event.data.object;

                await Payment.findOneAndUpdate(
                    { stripeChargeId: charge.id },
                    { status: "refunded" }
                );
                console.log("Payment Refunded : ", charge.id);
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