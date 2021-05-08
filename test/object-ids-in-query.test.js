const assert = require("assert");
const objectIdsInQuery = require("../object-ids-in-query");
const { ObjectID } = require("mongodb");
const Joi = require("joi");
const objectId = require("../object-id");

describe("object-ids-in-query hook", () => {
  it("throws error when first argument is a string", async () => {
    try {
      const validateObjectIds = objectIdsInQuery(["_id"]);
      assert(
        !validateObjectIds,
        "should have failed when string passed as first arg"
      );
    } catch (error) {
      assert(error);
    }
  });

  it("throws error when a key is not a string", async () => {
    try {
      const validateObjectIds = objectIdsInQuery([2]);
      assert(
        !validateObjectIds,
        "should have failed when string passed as first arg"
      );
    } catch (error) {
      assert(error);
    }
  });

  it("validates format { _id: ObjectID }", async () => {
    const context = {
      params: {
        query: {
          _id: "5b592fc76132820014f7a6a2",
        },
      },
    };
    const validateObjectIds = objectIdsInQuery(["_id"]);

    try {
      const resultContext = await validateObjectIds(context);
      assert(
        resultContext.params.query._id instanceof ObjectID,
        "id should have been converted"
      );
    } catch (error) {
      assert(!error);
    }
  });

  it("validates format { _id: [ObjectID] }", async () => {
    const context = {
      params: {
        query: {
          _id: ["5b592fc76132820014f7a6a2"],
        },
      },
    };
    const validateObjectIds = objectIdsInQuery(["_id"]);

    try {
      const resultContext = await validateObjectIds(context);
      assert(
        resultContext.params.query._id[0] instanceof ObjectID,
        "id should have been converted"
      );
    } catch (error) {
      assert(!error);
    }
  });

  it("validates format { _id: { $in: [ObjectID] } }", async () => {
    const context = {
      params: {
        query: {
          _id: {
            $in: [
              "5ef39576adc3291fb130e890",
              "5ef39576adc3291fb130e8a5",
              "5ef39576adc3291fb130e8a7",
              "5ef39576adc3291fb130e8ae",
              "5ef39576adc3291fb130e8b9",
              "5ef39576adc3291fb130e8c5",
              "5f034e879b6a96b6da8a3d97",
              "5f034ea09b6a96b6da8a3d99",
              "5f0350949b6a96b6da8a3d9b",
              "5f03534e9b6a96b6da8a3d9d",
              "5f035b149b6a96b6da8a3d9f",
              "5f03d82e29cc8617c89a909b",
            ],
          },
        },
      },
    };
    const validateObjectIds = objectIdsInQuery(["_id"]);

    try {
      const resultContext = await validateObjectIds(context);
      assert(
        resultContext.params.query._id.$in[0] instanceof ObjectID,
        "id should have been converted"
      );
    } catch (error) {
      assert(!error);
    }
  });

  it("validates format { _id: { $nin: [ObjectID] } }", async () => {
    const context = {
      params: {
        query: {
          _id: {
            $nin: [
              "5ef39576adc3291fb130e890",
              "5ef39576adc3291fb130e8a5",
              "5ef39576adc3291fb130e8a7",
              "5ef39576adc3291fb130e8ae",
              "5ef39576adc3291fb130e8b9",
              "5ef39576adc3291fb130e8c5",
              "5f034e879b6a96b6da8a3d97",
              "5f034ea09b6a96b6da8a3d99",
              "5f0350949b6a96b6da8a3d9b",
              "5f03534e9b6a96b6da8a3d9d",
              "5f035b149b6a96b6da8a3d9f",
              "5f03d82e29cc8617c89a909b",
            ],
          },
        },
      },
    };
    const validateObjectIds = objectIdsInQuery(["_id"]);

    try {
      const resultContext = await validateObjectIds(context);
      assert(
        resultContext.params.query._id.$nin[0] instanceof ObjectID,
        "id should have been converted"
      );
    } catch (error) {
      assert(!error);
    }
  });

  it("can pass array of objects", async () => {
    const context = {
      params: {
        query: {
          _id: { $in: ["5b592fc76132820014f7a6a2"] },
        },
      },
    };
    const validateObjectIds = objectIdsInQuery([{ key: "_id" }]);

    try {
      const resultContext = await validateObjectIds(context);
      assert(
        resultContext.params.query._id.$in[0] instanceof ObjectID,
        "id should have been converted"
      );
    } catch (error) {
      assert(!error);
    }
  });

  it("can pass additional validations with object syntax", async () => {
    const context = {
      params: {
        query: {
          "deeply-nested": {
            some: {
              nested: {
                object: {
                  _id: "5b592fc76132820014f7a6a2",
                },
              },
            },
          },
        },
      },
    };
    const validateObjectIds = objectIdsInQuery([
      {
        key: "deeply-nested",
        rules: [
          Joi.object({
            some: Joi.object({
              nested: Joi.object({
                object: Joi.object({
                  _id: objectId(),
                }),
              }),
            }),
          }),
        ],
      },
    ]);

    try {
      const resultContext = await validateObjectIds(context);
      assert(
        resultContext.params.query["deeply-nested"].some.nested.object
          ._id instanceof ObjectID,
        "id should have been converted"
      );
    } catch (error) {
      assert(!error);
    }
  });

  it("can handle dotted key name with one dot", async () => {
    const context = {
      params: {
        query: {
          "tags.tagId": "5b592fc76132820014f7a6a2",
        },
      },
    };
    const validateObjectIds = objectIdsInQuery([{ key: "tags.tagId" }]);

    try {
      const resultContext = await validateObjectIds(context);
      assert(
        resultContext.params.query["tags.tagId"] instanceof ObjectID,
        "id should have been converted"
      );
    } catch (error) {
      assert(!error);
    }
  });
});
