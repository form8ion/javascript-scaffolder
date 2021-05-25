import {scaffold} from '@form8ion/eslint';

export default async function ({config, projectRoot, unitTested, buildDirectory, additionalConfiguration}) {
  const {scope} = config;
  const {configs} = additionalConfiguration;
  const ignoreDirectories = [`/${buildDirectory}/`, ...unitTested ? ['/coverage/'] : []];

  return scaffold({scope, projectRoot, additionalConfigs: configs, ignore: {directories: ignoreDirectories}});
}
