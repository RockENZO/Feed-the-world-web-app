var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;  // Make sure this matches the name attribute in your form or AJAX request
        if (!email) {
            throw new Error("Email address is missing!");
        }

        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'rudy.raynor@ethereal.email',
                pass: 'aQwwdhDZVCaqhcpygb'
            }
        });

        const mailOptions = {
            from: 'feedtheworld@gmail.com',
            to: email,  // This should be a valid email string
            subject: 'Subscription Confirmation',
            text: 'Thank you for subscribing to our mailing list!'
        };

        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        res.send('Subscription successful');
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Subscription failed');
    }
});

module.exports = router;