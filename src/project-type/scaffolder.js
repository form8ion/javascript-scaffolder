import deepmerge from 'deepmerge';
import {projectTypes} from '@form8ion/javascript-core';
import scaffoldPackageType from './package';
import scaffoldApplicationType from './application';
import scaffoldCliType from './cli';
import buildCommonDetails from './common';

export default async function ({
  projectType,
  projectRoot,
  projectName,
  packageName,
  packageManager,
  visibility,
  applicationTypes,
  packageTypes,
  scope,
  tests,
  vcs,
  decisions,
  dialect
}) {
  switch (projectType) {
    case projectTypes.PACKAGE:
      return deepmerge(
        buildCommonDetails(visibility, vcs),
        await scaffoldPackageType({
          projectRoot,
          projectName,
          packageName,
          packageManager,
          visibility,
          scope,
          packageTypes,
          tests,
          vcs,
          decisions,
          dialect
        })
      );
    case projectTypes.APPLICATION:
      return deepmerge(
        buildCommonDetails(visibility, vcs),
        await scaffoldApplicationType({
          projectRoot,
          projectName,
          packageName,
          packageManager,
          applicationTypes,
          tests,
          decisions
        })
      );
    case projectTypes.CLI:
      return deepmerge(
        buildCommonDetails(visibility, vcs),
        await scaffoldCliType({packageName, visibility, projectRoot})
      );
    case 'Other':
      return {
        eslintConfigs: []
      };
    default:
      throw new Error(`The project-type of ${projectType} is invalid`);
  }
}
