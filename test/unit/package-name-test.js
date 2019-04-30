import {EOL} from 'os';
import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import * as packageNameValidator from '../../third-party-wrappers/validate-npm-package-name';
import packageName from '../../src/package-name';

suite('package name', () => {
  let sandbox;
  const projectName = any.word();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(packageNameValidator, 'default');
  });

  teardown(() => sandbox.restore());

  test('that the project name is returned if no scope is provided', () => {
    packageNameValidator.default.withArgs(projectName).returns({validForNewPackages: true});

    assert.equal(packageName(projectName), projectName);
  });

  test('that the scope is included in the name when provided', () => {
    const scope = any.word();
    const scopedName = `@${scope}/${projectName}`;
    packageNameValidator.default.withArgs(scopedName).returns({validForNewPackages: true});

    assert.equal(packageName(projectName, scope), scopedName);
  });

  test('that an error is thrown when the name is not valid for npm', () => {
    const errors = any.listOf(any.sentence);
    packageNameValidator.default.withArgs(projectName).returns({validForNewPackages: false, errors});

    assert.throws(
      () => packageName(projectName),
      `The package name ${projectName} is invalid:${EOL}\t* ${errors.join(`${EOL}\t* `)}`
    );
  });

  test('that a leading dot is stripped from the package name', () => {
    packageNameValidator.default
      .withArgs(`.${projectName}`)
      .returns({validForNewPackages: false, errors: ['name cannot start with a period']});

    assert.equal(packageName(`.${projectName}`), projectName);
  });

  test('that an error is thrown if more validation errors than a leading dot exist', () => {
    const errors = [...any.listOf(any.sentence), 'name cannot start with a period'];
    packageNameValidator.default.withArgs(projectName).returns({validForNewPackages: false, errors});

    assert.throws(
      () => packageName(projectName),
      `The package name ${projectName} is invalid:${EOL}\t* ${errors.join(`${EOL}\t* `)}`
    );
  });
});
