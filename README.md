# @feathers-plus/validate-joi

Companion utilities for [@feathers-plus/validate-joi](https://github.com/feathers-plus/validate-joi).

## Installation

```
npm install @feathers-plus/validate-joi-mongodb --save

yarn add @feathers-plus/validate-joi-mongodb
```

## Included Utilities

- `objectId` validates ObjectIDs.
- `objectIdsInQuery` a hook that converts ObjectID strings to full ObjectIds.

### objectId Joi Validator

A Joi validator for ObjectIds.

Here's an example validation file for an `faqs` service. You might put the following file next to the `faqs.service.js` file. Notice that it first defines an object called `attrs`.  The `attrs` are used by the `Joi.object(attrs)` and are also separately made available in the `module.exports`.  This format allows us to use the full schema to validate creates, and the `attrs` are used in the `validateProvidedData` hook in patch requests.  This format allows for a lot of flexibility for validating in the hooks.

```js
// src/services/faqs/faqs.model.js
const Joi = require('@hapi/joi')
const { objectId } = require('@feathers-plus/validate-joi-mongodb')

const attrs = {
  _id: objectId(),
  question: Joi.string().disallow(null).required(),
  answer: Joi.string().disallow(null).required(),
  isPublic: Joi.boolean().default(false),
  createdBy: objectId().disallow(null).required()
}

module.exports = {
  attrs,
  schema: Joi.object(attrs)
}
```

See a full example further down this page.

## objectIdsInQuery Hook

The `objectIdsInQuery` hook converts stringified ObjectIDs in a Feathers query object to their full ObjectID form.  This is especially useful when you are using the `feathers-mongodb` service adapter, which does not automatically convert query params the way that `feathers-mongoose` does.  Without this hook, a string version of an ObjectID will not match an ObjectID stored in the database.  With this hook, the conversion to a full ObjectID will occur before the query is sent to the MongoDB server, allowing results to be found.

See the next section for an example that uses this hook.

## Example

This example shows how to use both the `objectId` validator and the `objectIdsInQuery` hook.

```js
const { authenticate } = require('../../hooks/')
const { iff, isProvider } = require('feathers-hooks-common')
const validate = require('@feathers-plus/validate-joi')
const { objectId, objectIdsInQuery } = require('@feathers-plus/validate-joi-mongodb')
const { attrs, schema } = require('./faqs.model')

module.exports = {
  before: {
    all: [ 
      // ... handle authentication first
      iff(
        isProvider('external'),
        authenticate('auth0')
      ),
      objectIdsInQuery(['_id', 'createdBy'])
    ],
    find: [],
    get: [],
    create: [
      validate.form(schema, { abortEarly: false })
    ],
    update: [
      validate.form(schema, { abortEarly: false })
    ],
    patch: [
      validate.validateProvidedData(attrs, { abortEarly: false })
    ],
    remove: []
  }
}
```

## Tests

`npm test` to run tests.

`npm run cover` to run tests plus coverage.

## A Note on Internationalization

The `options` in `Joi.validate(value, schema, options, cb)`supports a
[`language` option](https://github.com/hapijs/joi/blob/v9.0.0/API.md#validatevalue-schema-options-callback)
with which you can change
[Joi error messages](https://github.com/hapijs/joi/blob/v9.0.0/lib/language.js)
in bulk.

You can then internationalize your field names and regex descriptions in the schema, e.g.

```js
Joi.string().regex(/^[\sa-zA-Z0-9]$/, i18n('letters, number and spaces')).label(i18n('Confirm password'))
```

These are suitable methods to internationalize the majority of Joi error messages.

## Contributors

- [eddyystop](https://github.com/feathers-plus)

## License

MIT. See LICENSE.
