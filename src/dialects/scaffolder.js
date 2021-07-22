import {dialects} from '@form8ion/javascript-core';
import scaffoldBabel from './babel';

export default function ({dialect, projectRoot, configs, tests, buildDirectory}) {
  if (dialects.BABEL === dialect) {
    return scaffoldBabel({preset: configs.babelPreset, projectRoot, tests, buildDirectory});
  }

  return {};
}
