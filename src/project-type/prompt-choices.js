import {dialects, projectTypes} from '@form8ion/javascript-core';
import {questionNames} from '../prompts/question-names';

export default function ({[questionNames.DIALECT]: dialect}) {
  const projectTypeValues = Object.values(projectTypes);

  if (dialects.COMMON_JS === dialect) {
    return projectTypeValues.filter(type => ![projectTypes.CLI, projectTypes.APPLICATION].includes(type));
  }

  return projectTypeValues;
}
