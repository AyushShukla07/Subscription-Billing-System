import nodemailer from 'nodemailer';

export const sendInvoiceEmail = async (to, invoiceUrl) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: `Billing System <${process.env.EMAIL_USER}`,
        to,
        subject: "Your Invoice",
        html: `
        <h3>Payment Successful</h3>
        <p>Your invoice is ready.</p>
        <a href="${invoiceUrl}" target="_blank">Download Invoice PDF</a>
    `
    });
};