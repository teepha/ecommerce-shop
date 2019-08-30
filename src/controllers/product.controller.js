/**
 * The Product controller contains all static methods that handles product request
 * Some methods work fine, some needs to be implemented from scratch while others may contain one or two bugs
 * The static methods and their function include:
 *
 * - getAllProducts - Return a paginated list of products
 * - searchProducts - Returns a list of product that matches the search query string
 * - getProductsByCategory - Returns all products in a product category
 * - getProductsByDepartment - Returns a list of products in a particular department
 * - getProduct - Returns a single product with a matched id in the request params
 * - getAllDepartments - Returns a list of all product departments
 * - getDepartment - Returns a single department
 * - getAllCategories - Returns all categories
 * - getSingleCategory - Returns a single category
 * - getDepartmentCategories - Returns all categories in a department
 *
 *  NB: Check the BACKEND CHALLENGE TEMPLATE DOCUMENTATION in the readme of this repository to see our recommended
 *  endpoints, request body/param, and response object for each of these method
 */
import { sequelize } from '../database/models';
import { paginateItems } from '../helpers/pagination.helper';

/**
 *
 *
 * @class ProductController
 */
class ProductController {
  /**
   * get all products
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getAllProducts(req, res, next) {
    const pagination = paginateItems(req);
    try {
      const allProductsCount = await sequelize.query('CALL catalog_count_products_on_catalog()');
      const allProducts = await sequelize.query(
        'CALL catalog_get_products_on_catalog(:inShortProductDescriptionLength, :inProductsPerPage, :inStartItem)',
        {
          replacements: {
            inShortProductDescriptionLength: pagination.descriptionLength,
            inProductsPerPage: pagination.limit,
            inStartItem: pagination.offset,
          },
        }
      );
      return res
        .status(200)
        .json({ count: allProductsCount[0].products_on_catalog_count, rows: allProducts });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * search all products
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async searchProducts(req, res, next) {
    // all_words should either be on or off
    // implement code to search product
    let { query_string, all_words } = req.query;
    if (!query_string) {
      return res.status(400).json({ message: 'Query string is required!' });
    }
    if (!all_words) {
      all_words = 'on';
    }
    const pagination = paginateItems(req);
    try {
      const productsCount = await sequelize.query(
        'CALL catalog_count_search_result(:inSearchString, :inAllWords)',
        {
          replacements: {
            inSearchString: query_string,
            inAllWords: all_words,
          },
        }
      );
      const products = await sequelize.query(
        'CALL catalog_search(:inSearchString, :inAllWords, :inShortProductDescriptionLength, :inProductsPerPage, :inStartItem)',
        {
          replacements: {
            inSearchString: query_string,
            inAllWords: all_words,
            inShortProductDescriptionLength: pagination.descriptionLength,
            inProductsPerPage: pagination.limit,
            inStartItem: pagination.offset,
          },
        }
      );
      return res.status(200).json({ count: productsCount[0].search_count, rows: products });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get all products by caetgory
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getProductsByCategory(req, res, next) {
    const { category_id } = req.params;
    const pagination = paginateItems(req);
    try {
      const productsCount = await sequelize.query(
        'CALL catalog_count_products_in_category(:inCategoryId)',
        {
          replacements: {
            inCategoryId: category_id,
          },
        }
      );
      const categoryProducts = await sequelize.query(
        'CALL catalog_get_products_in_category(:inCategoryId, :inShortProductDescriptionLength, :inProductsPerPage, :inStartItem)',
        {
          replacements: {
            inCategoryId: category_id,
            inShortProductDescriptionLength: pagination.descriptionLength,
            inProductsPerPage: pagination.limit,
            inStartItem: pagination.offset,
          },
        }
      );
      return res
        .status(200)
        .json({ count: productsCount[0].categories_count, rows: categoryProducts });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get all products by department
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product data
   * @memberof ProductController
   */
  static async getProductsByDepartment(req, res, next) {
    // implement the method to get products by department
    const { department_id } = req.params;
    const pagination = paginateItems(req);
    try {
      const productsCount = await sequelize.query(
        'CALL catalog_count_products_on_department(:inDepartmentId)',
        {
          replacements: {
            inDepartmentId: department_id,
          },
        }
      );
      const departmentProducts = await sequelize.query(
        'CALL catalog_get_products_on_department(:inDepartmentId, :inShortProductDescriptionLength, :inProductsPerPage, :inStartItem)',
        {
          replacements: {
            inDepartmentId: department_id,
            inShortProductDescriptionLength: pagination.descriptionLength,
            inProductsPerPage: pagination.limit,
            inStartItem: pagination.offset,
          },
        }
      );
      return res
        .status(200)
        .json({ count: productsCount[0].products_on_department_count, rows: departmentProducts });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get single product details
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product details
   * @memberof ProductController
   */
  static async getProduct(req, res, next) {
    const { product_id } = req.params; // eslint-disable-line
    try {
      const product = await sequelize.query('CALL catalog_get_product_info(:inProductId)', {
        replacements: { inProductId: product_id },
      });
      if (product.length) {
        return res.status(200).json(...product);
      }
      return res.status(404).json({
        error: {
          status: 404,
          message: `Product with id ${product_id} does not exist`,
          field: 'product_id',
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get all departments
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and department list
   * @memberof ProductController
   */
  static async getAllDepartments(req, res, next) {
    try {
      const departments = await sequelize.query('CALL catalog_get_departments_list()');
      return res.status(200).json(departments);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get a single department
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getDepartment(req, res, next) {
    const { department_id } = req.params; // eslint-disable-line
    try {
      const department = await sequelize.query(
        'CALL catalog_get_department_details(:inDepartmentId)',
        { replacements: { inDepartmentId: department_id } }
      );
      if (department.length) {
        return res.status(200).json(...department);
      }
      return res.status(404).json({
        error: {
          status: 404,
          code: 'DEP_02',
          message: 'The department with this ID does not exist.',
          field: 'department_id',
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method should get all categories
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getAllCategories(req, res, next) {
    // Implement code to get all categories here
    const pagination = paginateItems(req);
    try {
      const categoriesCount = await sequelize.query('CALL catalog_count_categories()');
      const categories = await sequelize.query(
        'CALL catalog_get_categories(:inCategoriesPerPage, :inStartItem)',
        {
          replacements: {
            inCategoriesPerPage: pagination.limit,
            inStartItem: pagination.offset,
          },
        }
      );
      return res.status(200).json({ count: categoriesCount[0].categories_count, rows: categories });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method should get a single category using the categoryId
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getSingleCategory(req, res, next) {
    const { category_id } = req.params; // eslint-disable-line
    // implement code to get a single category here
    try {
      const category = await sequelize.query('CALL catalog_get_category_details(:inCategoryId)', {
        replacements: {
          inCategoryId: category_id,
        },
      });
      if (category.length) {
        return res.status(200).json(...category);
      }
      return res.status(404).json({
        error: {
          status: 404,
          code: 'CAT_01',
          message: "Don't exist category with this ID.",
          field: 'category_id',
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method should get list of categories in a department
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getDepartmentCategories(req, res, next) {
    const { department_id } = req.params; // eslint-disable-line
    // implement code to get categories in a department here
    try {
      const departmentCategories = await sequelize.query(
        'CALL catalog_get_categories_list(:inDepartmentId)',
        {
          replacements: {
            inDepartmentId: department_id,
          },
        }
      );
      return res.status(200).json(departmentCategories);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * This method should get list of categories in a product
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  static async getProductCategories(req, res, next) {
    const { product_id } = req.params; // eslint-disable-line
    // implement code to get categories in a product here
    try {
      const productCategories = await sequelize.query(
        'CALL catalog_get_categories_for_product(:inProductId)',
        {
          replacements: {
            inProductId: product_id,
          },
        }
      );
      return res.status(200).json(productCategories);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get product details
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product details
   * @memberof ProductController
   */
  static async getProductDetails(req, res, next) {
    const { product_id } = req.params; // eslint-disable-line
    try {
      const productDetails = await sequelize.query(
        'CALL catalog_get_product_details(:inProductId)',
        {
          replacements: { inProductId: product_id },
        }
      );
      return res.status(200).json(...productDetails);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get product locations
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product locations
   * @memberof ProductController
   */
  static async getProductLocations(req, res, next) {
    const { product_id } = req.params; // eslint-disable-line
    try {
      const productLocations = await sequelize.query(
        'CALL catalog_get_product_locations(:inProductId)',
        {
          replacements: { inProductId: product_id },
        }
      );
      return res.status(200).json(...productLocations);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * get product reviews
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product reviews
   * @memberof ProductController
   */
  static async getProductReviews(req, res, next) {
    const { product_id } = req.params; // eslint-disable-line
    try {
      const productReviews = await sequelize.query(
        'CALL catalog_get_product_reviews(:inProductId)',
        {
          replacements: { inProductId: product_id },
        }
      );
      return res.status(200).json(productReviews);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * add product review
   *
   * @static
   * @param {object} req express request object
   * @param {object} res express response object
   * @param {object} next next middleware
   * @returns {json} json object with status and product reviews
   * @memberof ProductController
   */
  static async createProductReview(req, res, next) {
    const { customer_id } = req;
    const { product_id } = req.params;
    const { review, rating } = req.body;
    try {
      const productReview = await sequelize.query(
        'CALL catalog_create_product_review(:inCustomerId, :inProductId, :inReview, :inRating)',
        {
          replacements: {
            inCustomerId: customer_id,
            inProductId: product_id,
            inReview: review,
            inRating: rating,
          },
        }
      );
      return res.status(201).json(...productReview);
    } catch (error) {
      return next(error);
    }
  }
}

export default ProductController;
