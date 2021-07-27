import {dialects, projectTypes} from '@form8ion/javascript-core';
import {assert} from 'chai';
import any from '@travi/any';
import {questionNames} from '../prompts/question-names';
import buildProjectTypeChoices from './prompt-choices';

suite('project-type prompt choices', () => {
  test('that all types are provided when the chosen dialect is not common-js', () => {
    assert.deepEqual(buildProjectTypeChoices({[questionNames.PROJECT_TYPE]: any.word()}), Object.values(projectTypes));
  });

  test('that application and cli removed from the list when the chosen dialect is common-js', () => {
    assert.deepEqual(
      buildProjectTypeChoices({[questionNames.DIALECT]: dialects.COMMON_JS}),
      Object.values(projectTypes).filter(type => ![projectTypes.CLI, projectTypes.APPLICATION].includes(type))
    );
  });
});
