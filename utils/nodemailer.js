const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.Email_Id,
    pass: process.env.Email_Pass,
  },
});

async function sendMail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"Cartify 🛒" <${process.env.Email_Id}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  sendMail,
};
