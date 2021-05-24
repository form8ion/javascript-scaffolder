import {scaffold} from '@form8ion/eslint';

export default async function ({config, projectRoot, unitTested, buildDirectory, additionalConfigs}) {
  const {scope} = config;
  const ignoreDirectories = [`/${buildDirectory}/`, ...unitTested ? ['/coverage/'] : []];

  return scaffold({scope, projectRoot, additionalConfigs, ignore: {directories: ignoreDirectories}});
}
