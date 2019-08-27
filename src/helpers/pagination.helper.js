/**
 * @description paginates items
 *
 * @param {object} req the payload
 * @returns {object} object with offset, limit, and description length
 * @method generateToken
 */
export const paginateItems = req => {
  let { page, limit, description_length } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  let descriptionLength = parseInt(description_length);
  let offset = 0;
  if (!page) {
    page = 1;
  }
  if (!limit) {
    limit = 20;
  }
  if (!descriptionLength) {
    descriptionLength = 200;
  }
  offset = limit * page - limit;

  return { offset, limit, descriptionLength };
};
