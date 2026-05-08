import nodemailer from "nodemailer";

const transporter =
  nodemailer.createTransport({
    service: "gmail",

    auth: {
      user:
        process.env.EMAIL_USER,

      pass:
        process.env.EMAIL_PASS,
    },

    logger: true,
    debug: true,
  });

const sendEmail = async (
  email,
  otp
) => {
  await transporter.sendMail({
    from:
      process.env.EMAIL_USER,

    to: email,

    subject: "OTP",

    html: `<h1>${otp}</h1>`,
  });
};

export default sendEmail;