export default function (vcsIgnoreLists = {}) {
  return {
    files: vcsIgnoreLists.files || [],
    directories: ['/node_modules/', ...vcsIgnoreLists.directories || []]
  };
}
