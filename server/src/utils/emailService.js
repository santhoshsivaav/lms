const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Email templates
const emailTemplates = {
    paymentSuccess: (data) => ({
        subject: 'Payment Successful',
        html: `
            <h1>Payment Successful</h1>
            <p>Dear ${data.name},</p>
            <p>Your payment of ${data.amount} ${data.currency} has been processed successfully.</p>
            <p>Transaction ID: ${data.paymentId}</p>
            <p>Thank you for your subscription!</p>
        `,
    }),

    paymentFailed: (data) => ({
        subject: 'Payment Failed',
        html: `
            <h1>Payment Failed</h1>
            <p>Dear ${data.name},</p>
            <p>Your payment of ${data.amount} ${data.currency} has failed.</p>
            <p>Error: ${data.error}</p>
            <p>Please try again or contact support if the issue persists.</p>
        `,
    }),

    subscriptionActivated: (data) => ({
        subject: 'Subscription Activated',
        html: `
            <h1>Subscription Activated</h1>
            <p>Dear ${data.name},</p>
            <p>Your subscription has been activated successfully.</p>
            <p>Start Date: ${data.startDate}</p>
            <p>End Date: ${data.endDate}</p>
            <p>Enjoy your learning journey!</p>
        `,
    }),

    subscriptionCancelled: (data) => ({
        subject: 'Subscription Cancelled',
        html: `
            <h1>Subscription Cancelled</h1>
            <p>Dear ${data.name},</p>
            <p>Your subscription has been cancelled.</p>
            <p>Cancellation Date: ${data.cancelledAt}</p>
            <p>We hope to see you again soon!</p>
        `,
    }),

    subscriptionCompleted: (data) => ({
        subject: 'Subscription Completed',
        html: `
            <h1>Subscription Completed</h1>
            <p>Dear ${data.name},</p>
            <p>Your subscription period has ended.</p>
            <p>Completion Date: ${data.completedAt}</p>
            <p>Renew your subscription to continue learning!</p>
        `,
    }),
};

// Send email function
const sendEmail = async ({ to, subject, text, html, template, templateData }) => {
    try {
        let emailContent = {};

        if (template && templateData) {
            // Use template if provided
            const templateContent = emailTemplates[template](templateData);
            emailContent = {
                subject: templateContent.subject,
                html: templateContent.html,
            };
        } else {
            // Use direct content if no template
            emailContent = {
                subject,
                text,
                html,
            };
        }

        const mailOptions = {
            from: process.env.SMTP_FROM,
            to,
            ...emailContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = {
    sendEmail,
    emailTemplates,
}; 