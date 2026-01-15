//postman testing link for login api
// http://localhost:4000/api/auth/register
//http://localhost:5000/api/auth/login

// go to this site for nodemailer: https://nodemailer.com/
//we use nodemailer in order to send emails to users for verification and password reset

import nodemailer from 'nodemailer';

//create transporter
const transporter = nodemailer.createTransport({

    //we will use brevo SMTP & API: https://app.brevo.com/settings/keys/smtp
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },


});
export default transporter;