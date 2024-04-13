import { createTransport } from "nodemailer";

import { emailConfig } from "@config/scraper.config";

const transporter = createTransport({
  host: "smtp.zoho.eu",
  port: 465,
  secure: true,
  auth: {
    user: emailConfig.user,
    pass: emailConfig.pass
  }
});

export async function sendWatchNotification(emailText: string) {
  if (process.env.NODE_ENV === "develop") {
    return;
  }

  // await transporter.sendMail({
  //   from: process.env["EMAIL"],
  //   to: process.env["EMAILTO"],
  //   subject: "Ny klocka tillgänglig! ⌚",
  //   text: emailText
  // });
}

export async function sendErrorNotification(err: unknown) {
  if (process.env.NODE_ENV === "develop") {
    return;
  }

  // await transporter.sendMail({
  //   from: emailConfig.user,
  //   to: emailConfig.emailTo,
  //   subject: "KS Web Scraper: Ett fel inträffade!",
  //   text: `Error message:\n\n${err}`
  // });
}
