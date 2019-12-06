import {scaffold as scaffoldCucumber} from '@form8ion/cucumber-scaffolder';

export default async function ({projectRoot}) {
  return scaffoldCucumber({projectRoot});
}
