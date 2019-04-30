import {EOL} from 'os';
import validatePackageName from '../third-party-wrappers/validate-npm-package-name';

export default function (projectName, scope) {
  const name = `${scope ? `@${scope}/` : ''}${projectName}`;

  const {validForNewPackages, errors} = validatePackageName(name);

  if (validForNewPackages) return name;
  if (1 === errors.length && errors.includes('name cannot start with a period')) return projectName.slice(1);

  throw new Error(`The package name ${name} is invalid:${EOL}\t* ${errors.join(`${EOL}\t* `)}`);
}
