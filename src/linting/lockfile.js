export default function () {
  return {
    devDependencies: ['lockfile-lint'],
    scripts: {
      'lint:lockfile': 'lockfile-lint --path package-lock.json --type npm --validate-https --allowed-hosts npm'
    }
  };
}
