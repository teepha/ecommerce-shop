import { validationResult } from 'express-validator/check';

/**
 *  Check validation result for an error message and formats the error message
 *
 * @param {object} req HTTP request object
 * @param {object} res HTTP response object
 * @param {function} next callback
 * @returns {object}  json object with the status and formatted error message
 * @method
 */
export const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let code;
    errors.array().map(error => {
      if (error.msg == 'field is required.') {
        code = 'USR_02';
      }
      if (error.msg == 'is invalid.') {
        code = 'USR_03';
      }
      if (error.msg == 'is not number') {
        code = 'USR_09';
      }
      if (error.param == 'department_id') {
        code = 'DEP_01';
      }
      res.status(400).json({
        error: {
          status: 400,
          code,
          message: `The ${error.param} ${error.msg}`,
          field: error.param,
        },
      });
    });
  } else {
    next();
  }
};

/**
 * Check if the credit card number is valid - Based on the Luhn Algorithm
 *
 * @param {object} req HTTP request object
 * @param {object} res HTTP response object
 * @param {function} next callback
 * @returns {object} json object with status and error message
 */
export const validateCreditCard = (req, res, next) => {
  let { credit_card } = req.body;
  // Accept only digits, dashes or spaces
  if (/[^0-9-\s]+/.test(credit_card)) {
    res.status(400).json({
      error: {
        status: 400,
        code: 'USR_08',
        message: 'this is an invalid Credit Card.',
        field: 'credit_card',
      },
    });
  }
  // The Luhn Algorithm
  let nCheck = 0,
    bEven = false;
  credit_card = credit_card.replace(/\D/g, '');
  for (var n = credit_card.length - 1; n >= 0; n--) {
    var cDigit = credit_card.charAt(n),
      nDigit = parseInt(cDigit, 10);

    if (bEven && (nDigit *= 2) > 9) nDigit -= 9;

    nCheck += nDigit;
    bEven = !bEven;
  }
  if (nCheck !== 0 && nCheck % 10 == 0) {
    return next();
  }
  res.status(400).json({
    error: {
      status: 400,
      code: 'USR_08',
      message: 'this is an invalid Credit Card.',
      field: 'credit_card',
    },
  });
};
