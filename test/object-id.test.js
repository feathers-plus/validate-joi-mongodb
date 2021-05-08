const assert = require("assert");
const objectId = require("../object-id");
const Joi = require("joi");
const { ObjectID } = require("mongodb");

const idString = "5af9f1e35b9df500148d6986";
const _id = new ObjectID(idString);

describe("Joi objectId validation", () => {
  it("updates valid objectId strings to ObjectIDs", () => {
    const { value } = objectId().validate(idString);

    assert(value instanceof ObjectID, "should get back an ObjectID");
  });

  it("validates ObjectIDs", () => {
    const { value } = objectId().validate(_id);

    assert(_id === value, "the _id should not be modified");
    assert(value instanceof ObjectID, "should get back an ObjectID");
  });

  it("allows null to pass", () => {
    const { value } = objectId().validate(null);

    assert(value === null, "the value should still be null");
  });

  it("throws an error on invalid strings", () => {
    const userSchema = Joi.object({
      userId: objectId(),
      name: Joi.string(),
    });
    const user = {
      userId: "moo",
      name: "Marshall Thompson",
    };
    const { error, value } = userSchema.validate(user);
    assert.equal(
      error.message,
      '"userId" objectId validation failed because Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
    );
    assert(value.userId === "moo", "the value should not have been changed");
  });

  it("Can be used in another schema", () => {
    const userSchema = Joi.object({
      userId: objectId(),
      name: Joi.string(),
    });

    const user = {
      userId: idString,
      name: "Marshall Thompson",
    };

    const { value } = userSchema.validate(user);

    assert(value.userId instanceof ObjectID, "userId should be an ObjectID");
  });

  it("Can disallow null values", () => {
    const userSchema = Joi.object({
      userId: objectId().disallow(null),
      name: Joi.string(),
    });

    const user = {
      userId: null,
      name: "Marshall Thompson",
    };

    const { error, value } = userSchema.validate(user);
    assert.equal(error.message, '"userId" contains an invalid value');

    assert(value.userId === null, "userId is still null");
  });
});
