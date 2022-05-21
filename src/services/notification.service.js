import { createTransport } from 'nodemailer';

import { email } from '../config/scraper.config.js';

const transporter = createTransport({
  host: 'smtp.zoho.eu',
  port: 465,
  secure: true,
  auth: {
    user: email.user,
    pass: email.pass
  }
});

export async function sendKernelNotification(emailText) {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: process.env.EMAILTO,
    subject: 'Ny klocka tillgänglig! ⌚',
    text: emailText
  });
}

export async function sendErrorNotification(err) {
  await transporter.sendMail({
    from: email.user,
    to: email.emailTo,
    subject: 'KS Web Scraper: An error has occurred!',
    text: `Error message:\n\n${err}`
  });
}
