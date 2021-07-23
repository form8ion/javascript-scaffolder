import {dialects} from '@form8ion/javascript-core';

export default function () {
  return [
    {name: 'Common JS (no transpilation)', value: dialects.COMMON_JS, short: 'cjs'},
    {name: 'Modern JavaScript (transpiled)', value: dialects.BABEL, short: 'modern'}
  ];
}
