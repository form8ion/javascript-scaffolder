import {dialects} from '@form8ion/javascript-core';

import scaffoldBabel from './babel';
import scaffoldTypescript from './typescript';
import scaffoldEsm from './esm';

export default function ({dialect, projectType, projectRoot, configs, tests, buildDirectory, testFilenamePattern}) {
  switch (dialect) {
    case dialects.BABEL:
      return scaffoldBabel({preset: configs.babelPreset, projectRoot, tests, buildDirectory});
    case dialects.TYPESCRIPT:
      return scaffoldTypescript({config: configs.typescript, projectType, projectRoot, testFilenamePattern});
    case dialects.ESM:
      return scaffoldEsm();
    default:
      return {eslint: {}};
  }
}
