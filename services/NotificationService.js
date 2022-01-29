// web_scraper/src/srvices/NotificationService.js
'use strict';
const config = require('../config/scraper_config');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.eu',
  port: 465,
  secure: true,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

module.exports = {
  async sendKernelNotification(emailText) {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: process.env.EMAILTO,
      subject: `Ny klocka tillgänglig! ⌚`,
      text: emailText,
    });
  },
  async sendErrorNotification(err) {
    await transporter.sendMail({
      from: config.email.user,
      to: config.email.emailTo,
      subject: `KS Web Scraper: An error occured!`,
      text: `Error message:\n\n${err}`,
    });
  },
};
