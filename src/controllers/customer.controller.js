/**
 * Customer controller handles all requests that has to do with customer
 * Some methods needs to be implemented from scratch while others may contain one or two bugs
 *
 * - create - allow customers to create a new account
 * - login - allow customers to login to their account
 * - getCustomerProfile - allow customers to view their profile info
 * - updateCustomerProfile - allow customers to update their profile info like name, email, password, day_phone, eve_phone and mob_phone
 * - updateCustomerAddress - allow customers to update CreditCard info
 * - updateCreditCard - allow customers to update their credit card number
 *
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */
import { Customer, sequelize } from '../database/models';
import { generateToken } from '../helpers/jwt.helper';
import { fetchFacebookData } from '../helpers/fetchFacebookData.helper';

/**
 *
 *
 * @class CustomerController
 */
class CustomerController {
  /**
   * create a customer record
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, customer data and access token
   * @memberof CustomerController
   */
  static async create(req, res, next) {
    // Implement the function to create the customer account
    const { name, email, password } = req.body;
    const foundCustomer = await Customer.findOne({
      where: { email },
    });
    if (foundCustomer) {
      res.status(400).json({
        error: {
          status: 400,
          code: 'USR_04',
          message: 'The email already exist.',
          field: 'email',
        },
      });
    }
    try {
      const newCustomer = await Customer.create(req.body);
      const customer = await sequelize.query('CALL customer_get_customer(:inCustomerId)', {
        replacements: { inCustomerId: newCustomer.dataValues.customer_id },
      });
      const accessToken = generateToken({ customer_id: newCustomer.dataValues.customer_id });
      return res.status(201).json({
        customer: customer[0],
        accessToken: `Bearer ${accessToken}`,
        expiresIn: '24h',
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * log in a customer
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, and access token
   * @memberof CustomerController
   */
  static async login(req, res, next) {
    // implement function to login to user account
    const { email, password } = req.body;
    try {
      const customer = await sequelize.query('CALL customer_get_login_info(:inEmail)', {
        replacements: { inEmail: email },
      });
      if (customer.length) {
        if (customer[0].password === password) {
          const loginCustomer = await sequelize.query('CALL customer_get_customer(:inCustomerId)', {
            replacements: { inCustomerId: customer[0].customer_id },
          });
          const accessToken = generateToken({ customer_id: customer[0].customer_id });
          return res.status(200).json({
            customer: loginCustomer[0],
            accessToken: `Bearer ${accessToken}`,
            expiresIn: '24h',
          });
        }
        return res.status(400).json({
          error: {
            status: 400,
            code: 'USR_01',
            message: 'Email or Password is invalid.',
            field: 'password',
          },
        });
      }
      return res.status(400).json({
        error: {
          status: 400,
          code: 'USR_05',
          message: "The email doesn't exist.",
          field: 'email',
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Facebook login a customer
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status, and access token
   * @memberof CustomerController
   */
  static async facebookLogin(req, res, next) {
    const { access_token } = req.body;
    try {
      const {
        data: { email, name },
      } = await fetchFacebookData(access_token);
      const foundCustomer = await Customer.findOne({
        where: { email },
      });
      if (foundCustomer) {
        const accessToken = generateToken({ customer_id: foundCustomer.customer_id });
        return res.status(200).json({
          customer: foundCustomer.getSafeDataValues(),
          accessToken: `Bearer ${accessToken}`,
          expiresIn: '24h',
        });
      }
      const newCustomer = await Customer.create({
        email,
        name,
        password: name,
      });
      const customer = await sequelize.query('CALL customer_get_customer(:inCustomerId)', {
        replacements: { inCustomerId: newCustomer.dataValues.customer_id },
      });
      const accessToken = generateToken({ customer_id: customer.customer_id });
      return res.status(201).json({
        customer: customer[0],
        accessToken: `Bearer ${accessToken}`,
        expiresIn: '24h',
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get customer profile data
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async getCustomerProfile(req, res, next) {
    // fix the bugs in this code
    const { customer_id } = req;
    try {
      const customer = await sequelize.query('CALL customer_get_customer(:inCustomerId)', {
        replacements: { inCustomerId: customer_id },
      });
      return res.status(200).json(...customer);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * update customer profile data such as name, email, password, day_phone, eve_phone and mob_phone
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async updateCustomerProfile(req, res, next) {
    // Implement function to update customer profile like name, day_phone, eve_phone and mob_phone
    const { customer_id } = req;
    const { name, email, password, day_phone, eve_phone, mob_phone } = req.body;
    try {
      await sequelize.query(
        'CALL customer_update_account(:inCustomerId, :inName, :inEmail, :inPassword, :inDayPhone, :inEvePhone, :inMobPhone)',
        {
          replacements: {
            inCustomerId: customer_id,
            inName: name,
            inEmail: email,
            inPassword: password,
            inDayPhone: day_phone,
            inEvePhone: eve_phone,
            inMobPhone: mob_phone,
          },
        }
      );
      const updatedProfile = await sequelize.query('CALL customer_get_customer(:inCustomerId)', {
        replacements: { inCustomerId: customer_id },
      });
      return res.status(200).json(...updatedProfile);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * update customer profile data such as address_1, address_2, city, region, postal_code, country and shipping_region_id
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async updateCustomerAddress(req, res, next) {
    // write code to update customer address info such as address_1, address_2, city, region, postal_code, country
    // and shipping_region_id
    const { customer_id } = req;
    const {
      address_1,
      address_2,
      city,
      region,
      postal_code,
      country,
      shipping_region_id,
    } = req.body;
    try {
      await sequelize.query(
        'CALL customer_update_address(:inCustomerId, :inAddress1, :inAddress2, :inCity, :inRegion, :inPostalCode, :inCountry, :inShippingRegionId)',
        {
          replacements: {
            inCustomerId: customer_id,
            inAddress1: address_1,
            inAddress2: address_2,
            inCity: city,
            inRegion: region,
            inPostalCode: postal_code,
            inCountry: country,
            inShippingRegionId: shipping_region_id,
          },
        }
      );
      const updatedAddress = await sequelize.query('CALL customer_get_customer(:inCustomerId)', {
        replacements: { inCustomerId: customer_id },
      });
      return res.status(200).json(...updatedAddress);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * update customer credit card
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status customer profile data
   * @memberof CustomerController
   */
  static async updateCreditCard(req, res, next) {
    // write code to update customer credit card number
    const { customer_id } = req;
    const { credit_card } = req.body;
    try {
      await sequelize.query('CALL customer_update_credit_card(:inCustomerId, :inCreditCard)', {
        replacements: {
          inCustomerId: customer_id,
          inCreditCard: credit_card,
        },
      });
      const updatedCardDetails = await sequelize.query(
        'CALL customer_get_customer(:inCustomerId)',
        {
          replacements: { inCustomerId: customer_id },
        }
      );
      updatedCardDetails.map(customer => {
        const slicedCardDetails = customer.credit_card.slice(15);
        customer.credit_card = `xxxxxxxxxxxx${slicedCardDetails}`;
      });
      return res.status(200).json(...updatedCardDetails);
    } catch (error) {
      return next(error);
    }
  }
}

export default CustomerController;
