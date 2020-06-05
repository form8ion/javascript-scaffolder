import deepmerge from 'deepmerge';
import scaffoldUnitTesting from './unit';

export default async function ({projectRoot, visibility, tests: {unit, integration}, vcs}) {
  const unitResults = unit ? await scaffoldUnitTesting({projectRoot, visibility, vcs}) : {};

  return deepmerge({devDependencies: [...(unit || integration) ? ['@travi/any'] : []], eslintConfigs: []}, unitResults);
}
