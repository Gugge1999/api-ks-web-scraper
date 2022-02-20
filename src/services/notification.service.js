'use strict';
const nodemailer = require('nodemailer');

const config = require('../../config/scraper.config');

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.eu',
  port: 465,
  secure: true,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

async function sendKernelNotification(emailText) {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: process.env.EMAILTO,
    subject: `Ny klocka tillgänglig! ⌚`,
    text: emailText,
  });
}

async function sendErrorNotification(err) {
  await transporter.sendMail({
    from: config.email.user,
    to: config.email.emailTo,
    subject: `KS Web Scraper: An error occured!`,
    text: `Error message:\n\n${err}`,
  });
}

module.exports = {
  sendKernelNotification,
  sendErrorNotification,
};
