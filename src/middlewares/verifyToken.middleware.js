import { decodeToken } from '../helpers/jwt.helper';

/**
 * @description A middleware to verify if Token is supplied,
 *      decodes the token and append the customer_id instance to the request object
 * @param {object} req HTTP request object
 * @param {object} res HTTP response object
 * @returns {object} HTTP response
 * @method verifyToken
 */

export const verifyToken = async (req, res, next) => {
  const accessToken = req.headers.authorization;
  if (!accessToken || !accessToken.startsWith('Bearer ')) {
    res.status(401).json({
      error: {
        status: 401,
        code: 'AUT_02',
        message: 'Access Unauthorized',
        field: 'NoAuth',
      },
    });
  }
  if (accessToken.startsWith('Bearer ')) {
    const token = accessToken.split(' ')[1];
    try {
      const decodedToken = await decodeToken(token);
      req.customer_id = decodedToken.customer_id;
      return next();
    } catch (error) {
      return res.status(500).json({
        error: `${error.name}: ${error.message}`,
      });
    }
  }
};
