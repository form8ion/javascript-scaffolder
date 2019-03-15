export default function ({linting, host, projectType}) {
  return {
    files: [...linting.vcsIgnore.files, ...'Application' === projectType ? ['.env'] : []],
    directories: [
      '/node_modules/',
      '/lib/',
      '/coverage/',
      '/.nyc_output/',
      ...host.vcsIgnore.directories
    ]
  };
}
