export default function (projectName, scope) {
  return `${scope ? `@${scope}/` : ''}${projectName}`;
}
