import scaffoldPackageType from './package';
import scaffoldApplicationType from './application';
import scaffoldCliType from './cli';

export default function ({projectType, projectRoot, transpileLint, packageName, visibility, applicationTypes, scope}) {
  switch (projectType) {
    case 'Package':
      return scaffoldPackageType({projectRoot, transpileLint, packageName, visibility, scope});
    case 'Application':
      return scaffoldApplicationType({projectRoot, applicationTypes, transpileLint});
    case 'CLI':
      return scaffoldCliType({packageName, visibility});
    default:
      throw new Error(`The project-type of ${projectType} is invalid`);
  }
}
