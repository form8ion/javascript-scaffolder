export default function ({eslint, host, projectType}) {
  return {
    files: [...eslint.vcsIgnore.files, ...'Application' === projectType ? ['.env'] : []],
    directories: [
      '/node_modules/',
      '/lib/',
      '/coverage/',
      '/.nyc_output/',
      ...host.vcsIgnore.directories
    ]
  };
}
