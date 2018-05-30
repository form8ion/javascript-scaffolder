import * as joi from 'joi';
import hoek from 'hoek';

export function validate(options) {
  const validated = joi.validate(options, joi.object({
    projectRoot: joi.string().required(),
    projectName: joi.string().regex(/^@\w*\//, {invert: true}).required(),
    visibility: joi.string().valid(['Public', 'Private']).required(),
    license: joi.string().required(),
    vcs: joi.object({
      host: joi.string().required(),
      owner: joi.string().required(),
      name: joi.string().required()
    }).required(),
    ci: joi.string(),
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
      })
    }).default({}),
    overrides: joi.object({
      npmAccount: joi.string(),
      author: joi.object({
        name: joi.string().required(),
        email: joi.string().email(),
        url: joi.string().uri()
      })
    }).default({})
  }).required());

  hoek.assert(!validated.error, validated.error);

  return validated.value;
}
