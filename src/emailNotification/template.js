import Mailgen from 'mailgen';

// Configure mailgen by setting a theme and your product info
const mailGenerator = new Mailgen({
  theme: 'default',
  product: {
    // Appears in header & footer of e-mails
    name: 'E-Commerce Shop',
    link: 'https://github.com/teepha/ecommerce-shop',
    // Optional product logo
    // logo: 'https://mailgen.js/img/logo.png'
  },
});

const emailTemplate = (data, description) => {
  const emailBody = {
    body: {
      name: data.name,
      intro: 'Your order has been processed successfully.',
      table: {
        data: [
          {
            orderId: data.order_id,
            description,
            Amount: data.total_amount,
            Status: data.status,
          },
          
        ],
        columns: {
          // Optionally, customize the column widths
          customWidth: {
            orderId: '10%',
            Amount: '15%',
            Status: '10%',
          },
          // Optionally, change column text alignment
          customAlignment: {
            Amount: 'right',
          },
        },
      },
      action: {
        instructions: 'You can check the status of your order and more in your dashboard:',
        button: {
          color: '#3869D4',
          text: 'Go to Dashboard',
          link: `http://localhost:80/orders/${data.order_id}`,
        },
      },
      outro: 'We thank you for your purchase.',
    },
  };
  return mailGenerator.generate(emailBody);
};

export default emailTemplate;
