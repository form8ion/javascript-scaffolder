import scaffoldPackageType from './package';
import scaffoldApplicationType from './application';
import scaffoldCliType from './cli';

export default function ({
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
      return scaffoldPackageType({
        projectRoot,
        transpileLint,
        packageName,
        visibility,
        scope,
        packageTypes,
        tests,
        vcs,
        decisions
      });
    case 'Application':
      return scaffoldApplicationType({projectRoot, projectName, applicationTypes, transpileLint, tests, decisions});
    case 'CLI':
      return scaffoldCliType({packageName, visibility});
    default:
      throw new Error(`The project-type of ${projectType} is invalid`);
  }
}
