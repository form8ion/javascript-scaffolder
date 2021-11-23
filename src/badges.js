import deepmerge from 'deepmerge';

export default function (contributors) {
  return deepmerge.all(contributors).badges;
}
