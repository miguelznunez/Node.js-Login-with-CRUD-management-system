const nodemailer = require("nodemailer"),
mailGun = require("nodemailer-mailgun-transport");

require("dotenv").config();

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
    clientId: process.env.OAUTH_CLIENTID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN
  }
});

const activateAccountEmail = (email, id, token, callback) => {

  transporter.sendMail( {
    from: "mail.modernwebdesigners@gmail.com",
    to: email,
    subject: "Modern Web Designers - Account Verification",
    html: `<p>Please click on the following link, or paste it into your browser to complete the account activation process:<br><br><a href="http://localhost:5000/auth-management/auth-views/account-verification/${id}/${token}">http://localhost:5000/auth-management/auth-views/account-verification/${id}/${token}</a><br><br>The Team</p>`
    }, (err, info) => {
      if (err) callback(err, null)
      else callback(null, info)
    })

}

const accountDeletedEmail = (email, id, token, callback) => {

  transporter.sendMail( {
    from: "mail.modernwebdesigners@gmail.com",
    to: email,
    subject: "Modern Web Designers - Account Deleted",
    html: `<p>Your account has been deleted.<br><br>If you decide to comeback, <a href="http://localhost:5000/auth-management/auth-views/signup">you can sign up here.</a><br><br>The MWD team</p>`
    }, (err, info) => {
      if (err) callback(err, null)
      else callback(null, info)
    })

}

const resetPasswordEmail = (email, id, token, callback) => {

  transporter.sendMail( {
    from: "mail.modernwebdesigners@gmail.com",
    to: email,
    subject: "Modern Web Designers - Password Reset",
    html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account. Please click on the following link, or paste it into your browser to complete the process within one hour of receiving it:<br><br><a href="http://localhost:5000/auth-management/auth-views/password-update/${id}/${token}">http://localhost:5000/auth-management/auth-views/password-update/${id}/${token}</a><br><br>If you did not request this, please ignore this email and your password will remain unchanged.<br><br>The Team</p>`
    }, (err, info) => {
      if (err) callback(err, null)
      else callback(null, info)
    })

}

const newsletterWelcomeEmail = (email, callback) => {

  transporter.sendMail( {
    from: "mail.modernwebdesigners@gmail.com",
    to: email,
    subject: "Modern Web Designers - Welcome to the Newsletter",
    html: "<p>This is a test newsletter welcome email.<br><br>The MWD team</p>"
  }, (err, info) => {
    if (err) callback(err, null)
    else callback(null, info)
  })

}

const newsletterEmail = (subject, message, emails, callback) => {

  transporter.sendMail( {
    from: "mail.modernwebdesigners@gmail.com",
    to: emails,
    subject: subject,
    html: message
  }, (err, info) => {
    if (err) callback(err, null)
    else callback(null, info)
  })

}

module.exports = {resetPasswordEmail, accountDeletedEmail, activateAccountEmail, newsletterWelcomeEmail, newsletterEmail};
