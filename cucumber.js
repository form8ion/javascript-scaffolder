module.exports = {
  base: '--require-module @babel/register --publish-quiet --format-options \'{"snippetInterface": "async-await"}\'',
  wip: '--tags "@wip"',
  noWip: '--tags "not @wip"',
  focus: '--tags @focus'
};
