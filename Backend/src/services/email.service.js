const nodemailer = require('nodemailer');

function createTransporter() {
  const requiredEnvVars = ['EMAIL_USER', 'CLIENT_ID', 'CLIENT_SECRET', 'REFRESH_TOKEN'];
  const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]?.trim());

  if (missingEnvVars.length > 0) {
    console.error(`Email notifications are disabled. Set the following environment variables: ${missingEnvVars.join(', ')}`);
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
    },
  });
}

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  const transporter = createTransporter();
  if (!transporter) {
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Banking-Transaction " <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    if (error.code === 'EAUTH' && error.originalCode === 'EOAUTH2') {
      console.error('Email OAuth2 authentication failed. Regenerate the Gmail OAuth refresh token and update REFRESH_TOKEN.');
      return;
    }

    console.error('Error sending email:', error.message);
  }
};

async function sendRegistrationEmail(userEmail,name){

    const subject = 'Welcome to Banking-Transaction';
    const text = `Hello ${name},\n\nThank you for registering with Banking-Transaction. We're excited to have you on board!`;
    const html = `<p>Hello ${name},</p><p>Thank you for registering with Banking-Transaction. We're excited to have you on board!</p>`;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail,name,amount,toAccountId){

    const subject = 'Transaction Notification';
    const text = `Hello ${name},\n\nYour transaction has been processed successfully. Here are the details:\n\nAmount: ${amount}\nTo Account: ${toAccountId}`;
    const html = `<p>Hello ${name},</p><p>Your transaction has been processed successfully. Here are the details:</p><pre>Amount: ${amount}<br/>To Account: ${toAccountId}</pre>`;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail,name,amount,toAccountId){

    const subject = 'Transaction Failure Notification';
    const text = `Hello ${name},\n\nWe regret to inform you that your transaction has failed. Here are the details:\n\nAmount: ${amount}\nTo Account: ${toAccountId}`;
    const html = `<p>Hello ${name},</p><p>We regret to inform you that your transaction has failed. Here are the details:</p><pre>Amount: ${amount}<br/>To Account: ${toAccountId}</pre>`;

    await sendEmail(userEmail, subject, text, html);
}

module.exports = { sendRegistrationEmail, sendTransactionEmail, sendTransactionFailureEmail };