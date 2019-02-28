export default function () {
  return {
    devDependencies: ['cucumber', 'chai'],
    scripts: {'test:integration': 'DEBUG=any cucumber-js test/integration --require-module @babel/register --format-options \'{"snippetInterface": "async-await"}\''}   // eslint-disable-line max-len
  };
}
