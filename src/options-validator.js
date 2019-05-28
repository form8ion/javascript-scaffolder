import * as joi from '@hapi/joi';
import hoek from '@hapi/hoek';

export function validate(options) {
  const {error, value} = joi.validate(options, joi.object({
    projectRoot: joi.string().required(),
    projectName: joi.string().regex(/^@\w*\//, {invert: true}).required(),
    visibility: joi.string().valid(['Public', 'Private']).required(),
    license: joi.string().required(),
    vcs: joi.object({
      host: joi.string().required(),
      owner: joi.string().required(),
      name: joi.string().required()
    }),
    description: joi.string(),
    configs: joi.object({
      eslint: joi.object({
        packageName: joi.string().required(),
        prefix: joi.string().required()
      }),
      commitlint: joi.object({
        packageName: joi.string().required(),
        name: joi.string().required()
      }),
      babelPreset: joi.object({
        packageName: joi.string().required(),
        name: joi.string().required()
      }),
      remark: joi.string()
    }).default({}),
    overrides: joi.object({
      npmAccount: joi.string(),
      author: joi.object({
        name: joi.string().required(),
        email: joi.string().email(),
        url: joi.string().uri()
      })
    }).default({}),
    ciServices: joi.object().pattern(/^/, joi.object({
      scaffolder: joi.func().arity(1).required(),
      public: joi.boolean(),
      private: joi.boolean()
    })).default({}),
    hosts: joi.object().pattern(/^/, joi.object({
      scaffolder: joi.func().arity(1).required(),
      projectTypes: joi.array().items(joi.string().only(['static', 'node'])).default([])
    })).default({}),
    applicationTypes: joi.object().pattern(/^/, joi.func().arity(1)).default({})
  }).required());

  hoek.assert(!error, error);

  return value;
}
