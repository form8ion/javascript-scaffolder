export default function ({linting, host, testing, projectType}) {
  return {
    files: [...linting.vcsIgnore.files, ...'Application' === projectType ? ['.env'] : []],
    directories: [
      '/node_modules/',
      ...testing.vcsIgnore.directories,
      ...host.vcsIgnore.directories
    ]
  };
}
