import deepmerge from 'deepmerge';
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
    case 'Package':
      return deepmerge(
        buildCommonDetails(visibility, vcs),
        await scaffoldPackageType({
          projectRoot,
          transpileLint,
          packageName,
          visibility,
          scope,
          packageTypes,
          tests,
          vcs,
          decisions
        })
      );
    case 'Application':
      return deepmerge(
        buildCommonDetails(visibility, vcs),
        await scaffoldApplicationType({projectRoot, projectName, applicationTypes, transpileLint, tests, decisions})
      );
    case 'CLI':
      return deepmerge(
        buildCommonDetails(visibility, vcs),
        await scaffoldCliType({packageName, visibility, projectRoot})
      );
    default:
      throw new Error(`The project-type of ${projectType} is invalid`);
  }
}
