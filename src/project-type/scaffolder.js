import scaffoldPackageType from './package';
import scaffoldApplicationType from './application';

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
    default:
      throw new Error(`The project-type of ${projectType} is invalid`);
  }
}
