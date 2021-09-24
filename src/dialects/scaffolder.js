import {dialects} from '@form8ion/javascript-core';
import scaffoldBabel from './babel';
import scaffoldTypescript from './typescript';

export default function ({dialect, projectRoot, configs, tests, buildDirectory, testFilenamePattern}) {
  switch (dialect) {
    case dialects.BABEL:
      return scaffoldBabel({preset: configs.babelPreset, projectRoot, tests, buildDirectory});
    case dialects.TYPESCRIPT:
      return scaffoldTypescript({config: configs.typescript, projectRoot, testFilenamePattern});
    default:
      return {eslint: {}};
  }
}
