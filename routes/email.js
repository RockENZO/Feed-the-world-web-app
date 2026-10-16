const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const {mailOptions} = require('../config/runtime');

router.post('/subscribe', async (req, res) => {
    const email = req.body.email;
    if (typeof email !== 'string' || email.length > 320 || !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email)) {
        return res.status(400).send('Provide a single valid email address');
    }
    try {
        const configuration = mailOptions();
        if (!configuration) return res.status(503).send('Email service is not configured');
        const transporter = nodemailer.createTransport(configuration.transport);
        await transporter.sendMail({
            from: configuration.from, to: email,
            subject: 'Subscription Confirmation',
            text: 'Thank you for subscribing to our mailing list!'
        });
        res.send('Subscription successful');
    } catch (error) {
        console.error('Email delivery failed');
        res.status(503).send('Email service unavailable');
    }
});

module.exports = router;
