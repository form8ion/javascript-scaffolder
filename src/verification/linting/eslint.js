import {scaffold} from '@form8ion/eslint';
import deepmerge from 'deepmerge';

export default async function ({config, projectRoot, buildDirectory, additionalConfiguration}) {
  const {scope} = config;
  const {ignore} = additionalConfiguration;
  const ignores = deepmerge(ignore, {directories: [`/${buildDirectory}/`]});

  return scaffold({scope, projectRoot, ignore: {directories: ignores.directories}});
}
