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
  vcs
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
        vcs
      });
    case 'Application':
      return scaffoldApplicationType({projectRoot, projectName, applicationTypes, transpileLint, tests});
    case 'CLI':
      return scaffoldCliType({packageName, visibility});
    default:
      throw new Error(`The project-type of ${projectType} is invalid`);
  }
}
