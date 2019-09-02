import faker from 'faker';

export const createCustomer = async (chai, app) => {
  const customer = await chai
    .request(app)
    .post('/customers')
    .send({
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: 'password',
    });

  return customer;
};

export const loginCustomer = async (chai, app) => {
  const newCustomer = await createCustomer(chai, app);
  const customer = await chai
    .request(app)
    .post('/customers/login')
    .send({
      email: newCustomer.body.customer.email,
      password: 'password',
    });

  return customer;
};

export const userData = {
  invalidCustomerData: {
    email: 'some.user@email.com',
    password: 'password2',
  },
  customerProfileData: {
    password: 'password',
    day_phone: '080123212312',
    eve_phone: '080123212312',
    mob_phone: '2340987766899',
  },
  customerAddressData: {
    address_1: 'somethiing here',
    address_2: '',
    city: 'lagos',
    region: 'ikeja',
    postal_code: '100222',
    country: 'naija',
    shipping_region_id: 2,
  },
  validCreditCard: {
    credit_card: '4242 4242 4242 4242',
  },
  invalidCreditCard: {
    credit_card: '0000 0000 0000 0000',
  },
};
