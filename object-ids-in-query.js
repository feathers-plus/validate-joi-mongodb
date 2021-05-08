const objectId = require("./object-id");
const validate = require("@feathers-plus/validate-joi");
const Joi = require("joi");

/**
 * Creates a validation rule for each of the `keys` which validates and converts
 * - single objectIds
 * - an array of objectIds
 * - an object containing `{ $in: []}`
 * {Array} keys - An array of key names OR An array of objects holding a configuration
 */
module.exports = function objectIdsInQuery(keys) {
  if (!Array.isArray(keys)) {
    throw new Error(
      "the first argument to objectIdsInQuery should be an array of keys"
    );
  }

  const validations = {};
  keys.forEach((option) => {
    let key;
    const rules = [];

    if (typeof option === "string") {
      key = option;
    } else if (option.key) {
      key = option.key;
      if (option.rules && Array.isArray(option.rules)) {
        option.rules.forEach((rule) => {
          rules.push(rule);
        });
      }
    }
    if (key.includes(".")) {
      const [first, second] = key.split(".");

      // Make rules for first level. I don't think this is needed.  Dunno
      const baseRules = makeBaseRules(first);
      baseRules.forEach((rule) => {
        rules.push(rule);
      });

      const dotRules = [
        Joi.array().items(
          Joi.object({
            [second]: objectId(),
          })
        ),
        Joi.object({
          tags: Joi.object({
            [second]: objectId(),
          }),
        }),
        Joi.object({
          [key]: objectId(),
        }),
      ];
      dotRules.forEach((rule) => {
        rules.push(rule);
      });
    } else {
      const baseRules = makeBaseRules(key);
      baseRules.forEach((rule) => {
        rules.push(rule);
      });
    }
    if (typeof key !== "string") {
      throw new Error("all keys passed to objectIdsInQuery must be strings");
    }
    // Each item in this array is a possible validation match that Joi will handle:
    validations[key] = [...rules];
  });
  const _idSchema = Joi.object(validations);

  return validate.form(_idSchema, {
    allowUnknown: true,
    getContext: (context) => context.params.query,
    setContext: (context, values) => {
      if (values) {
        Object.assign(context.params.query, values);
      }
      return context;
    },
  });
};

function makeBaseRules() {
  return [
    // Handle single objectIds, like { _id: new ObjectID() }
    objectId(),
    // Handle an array of objectIds, like { userIds: [ new ObjectId() ]}
    Joi.array().items(objectId()),
    // Handle the $in: [] syntax
    Joi.object({
      $in: Joi.array().items(objectId()),
      $nin: Joi.array().items(objectId()),
    }),
  ];
}
