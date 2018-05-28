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
    ci: joi.string().required(),
    description: joi.string().required()
  }).required());

  hoek.assert(!validated.error, validated.error);
}
