const Joi = require("joi");
const { ObjectID } = require("mongodb");
/**
 * Custom objectId validator
 */
module.exports = function objectId() {
  return Joi.custom((value, helpers) => {
    if (value === null || value === undefined) {
      return value;
    }
    try {
      return new ObjectID(value);
    } catch (error) {
      const errVal = helpers.error("any.invalid");
      errVal.message = `"${errVal.path.join(
        "."
      )}" objectId validation failed because ${error.message}`;
      return errVal;
    }
  }, "objectId");
};
