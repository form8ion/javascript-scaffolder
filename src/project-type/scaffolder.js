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
  transpileLint,
  visibility,
  applicationTypes,
  packageTypes,
  scope,
  tests,
  vcs,
  decisions
}) {
  switch (projectType) {
    case projectTypes.PACKAGE:
      return deepmerge(
        buildCommonDetails(visibility, vcs),
        await scaffoldPackageType({
          projectRoot,
          transpileLint,
          projectName,
          packageName,
          visibility,
          scope,
          packageTypes,
          tests,
          vcs,
          decisions
        })
      );
    case projectTypes.APPLICATION:
      return deepmerge(
        buildCommonDetails(visibility, vcs),
        await scaffoldApplicationType({
          projectRoot,
          projectName,
          packageName,
          scope,
          applicationTypes,
          transpileLint,
          tests,
          decisions
        })
      );
    case projectTypes.CLI:
      return deepmerge(
        buildCommonDetails(visibility, vcs),
        await scaffoldCliType({packageName, visibility, projectRoot})
      );
    default:
      throw new Error(`The project-type of ${projectType} is invalid`);
  }
}
