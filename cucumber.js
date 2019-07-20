module.exports = {
  base: '--require-module @babel/register --format-options \'{"snippetInterface": "async-await"}\'',
  wip: '--tags "@wip"',
  noWip: '--tags "not @wip"',
  focus: '--tags @focus'
};
