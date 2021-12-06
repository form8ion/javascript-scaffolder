// ##### Dependencies:
import {scaffold as scaffoldJavaScript} from './lib/index.cjs';

// ##### Execute
(async () => {
  scaffoldJavaScript({
    configs: {
      eslint: {scope: '@form8ion'},
      remark: '@form8ion/remark-lint-preset',
      babelPreset: {name: '@form8ion', packageName: '@form8ion/babel-preset'},
      commitlint: {name: '@form8ion', packageName: '@form8ion/commitlint-config'}
    },
    overrides: {npmAccount: 'form8ion'},
    ciServices: {}
  });
})();
