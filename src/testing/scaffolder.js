import deepmerge from 'deepmerge';
import {scaffoldUnitTesting} from '@form8ion/javascript-core';

export default async function ({
  projectRoot,
  visibility,
  tests: {unit, integration},
  vcs,
  unitTestFrameworks,
  decisions
}) {
  const unitResults = unit
    ? await scaffoldUnitTesting({projectRoot, visibility, vcs, frameworks: unitTestFrameworks, decisions})
    : {};

  return deepmerge({devDependencies: [...(unit || integration) ? ['@travi/any'] : []]}, unitResults);
}
