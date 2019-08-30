import sgMail from '@sendgrid/mail';
import emailTemplate from './template';

const isTest = process.env.NODE_ENV === 'test';

const { SENDGRID_API_KEY, FROM_EMAIL } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

export const sendEmail = async (email, data, description) => {
  const msg = {
    to: email,
    from: FROM_EMAIL,
    subject: 'Your Order at E-Commerce Shop',
    html: emailTemplate(data, description),
  };
  sgMail.send(msg);
  return isTest ? Promise.resolve('Email Sent') : await sgMail.send(msg);
};
