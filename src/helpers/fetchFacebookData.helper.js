import axios from 'axios';

/**
 * @description A method to verify accessToken supplied,
 *      obtain customer data from facebook and return it
 *
 * @param {string} accessToken express request string
 * @returns {json} json object with customer name and email
 * @method fetchFacebookData
 */
export const fetchFacebookData = async accessToken => {
  try {
    return await axios.get(
      `https://graph.facebook.com/me?fields=name,gender,location,email&access_token=${accessToken}`,
      {
        headers: {
          'content-type': 'application/json',
        },
      }
    );
  } catch (error) {
    throw error.response.data;
  }
};
