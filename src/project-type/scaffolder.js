import scaffoldPackageType from './package';
import scaffoldApplicationType from './application';
import scaffoldCliType from './cli';

export default function ({
  projectType,
  projectRoot,
  transpileLint,
  packageName,
  visibility,
  applicationTypes,
  configs
}) {
  switch (projectType) {
    case 'Package':
      return scaffoldPackageType({projectRoot, transpileLint, packageName, visibility});
    case 'Application':
      return scaffoldApplicationType({projectRoot, applicationTypes, configs, transpileLint});
    case 'CLI':
      return scaffoldCliType({packageName, visibility});
    default:
      throw new Error(`The project-type of ${projectType} is invalid`);
  }
}
