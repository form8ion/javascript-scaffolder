import {assert} from 'chai';
import any from '@travi/any';
import packageName from '../../src/package-name';

suite('package name', () => {
  const projectName = any.word();

  test('that the project name is returned if no scope is provided', () => {
    assert.equal(packageName(projectName), projectName);
  });

  test('that the scope is included in the name when provided', () => {
    const scope = any.word();

    assert.equal(packageName(projectName, scope), `@${scope}/${projectName}`);
  });
});
