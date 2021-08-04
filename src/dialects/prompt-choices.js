import {dialects} from '@form8ion/javascript-core';

export default function ({babelPreset}) {
  return [
    {name: 'Common JS (no transpilation)', value: dialects.COMMON_JS, short: 'cjs'},
    ...babelPreset ? [{name: 'Modern JavaScript (transpiled)', value: dialects.BABEL, short: 'modern'}] : []
  ];
}