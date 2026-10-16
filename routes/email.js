const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const {mailOptions} = require('../config/runtime');
const {requireUser} = require('../middleware/authorization');
const attempts = new Map();
const cooldownMs = 60000;

router.post('/subscribe', requireUser, async (req, res) => {
    const email = req.session.user.email;
    if (typeof email !== 'string' || email.length > 320 || !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email)) {
        return res.status(400).send('Provide a single valid email address');
    }
    try {
        const configuration = mailOptions();
        if (!configuration) return res.status(503).send('Email service is not configured');
        const now = Date.now();
        for (const [user, time] of attempts) if (now-time >= cooldownMs) attempts.delete(user);
        const userId = req.session.user.user_id;
        if (attempts.has(userId)) {
            res.set('Retry-After',String(Math.ceil((cooldownMs-now+attempts.get(userId))/1000)));
            return res.status(429).send('Please wait before requesting another confirmation');
        }
        // Reserve before awaiting delivery so concurrent requests cannot all send.
        attempts.set(userId,now);
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
