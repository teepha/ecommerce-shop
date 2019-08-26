import jwt from 'jsonwebtoken';

/**
 * @description generate a jsonweb token
 *
 * @param {object} payload the payload
 * @returns {string} the generated token
 * @method generateToken
 */
export const generateToken = payload => {
  return jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '24h' });
};

/**
 * @description Decode a jsonweb token
 *
 * @param {string} token the token to decode
 * @returns {object} the decoded token
 * @method decodeToken
 */
export const decodeToken = token => {
  return jwt.verify(token, process.env.JWT_KEY);
};
