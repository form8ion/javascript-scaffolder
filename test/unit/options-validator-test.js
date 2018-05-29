import any from '@travi/any';
import {assert} from 'chai';
import {validate} from '../../src/options-validator';

suite('options validator', () => {
  test('that the options are required', () => assert.throws(() => validate(), '"value" is required'));

  test('that the `projectRoot` is required', () => {
    assert.throws(() => validate({}), 'child "projectRoot" fails because ["projectRoot" is required]');
  });

  test('that the `projectName` is required', () => assert.throws(
    () => validate({projectRoot: any.string()}),
    'child "projectName" fails because ["projectName" is required]'
  ));

  test('that the `projectName` should not include a scope', () => {
    const projectName = `@${any.word()}/${any.word()}`;

    assert.throws(
      () => validate({projectRoot: any.string(), projectName}),
      'child "projectName" fails because ' +
      `["projectName" with value "${projectName}" matches the inverted pattern: /^@\\w*\\//]`
    );
  });

  suite('visibility', () => {
    test('that the `visibility` is required', () => assert.throws(
      () => validate({projectRoot: any.string(), projectName: any.string()}),
      'child "visibility" fails because ["visibility" is required]'
    ));

    test('that `Public` is an allowed `visibility`', () => validate({
      projectRoot: any.string(),
      projectName: any.string(),
      visibility: 'Public',
      license: any.string(),
      vcs: {host: any.word(), owner: any.word(), name: any.word()},
      ci: any.string(),
      description: any.string()
    }));

    test('that `Private` is an allowed `visibility`', () => validate({
      projectRoot: any.string(),
      projectName: any.string(),
      visibility: 'Private',
      license: any.string(),
      vcs: {host: any.word(), owner: any.word(), name: any.word()},
      ci: any.string(),
      description: any.string()
    }));

    test('that `visibility` values other than `Public` or `Private` are invalid', () => assert.throws(
      () => validate({projectRoot: any.string(), projectName: any.string(), visibility: any.word()}),
      'child "visibility" fails because ["visibility" must be one of [Public, Private]]'
    ));
  });

  test('that `license` is required', () => assert.throws(
    () => validate({
      projectRoot: any.string(),
      projectName: any.string(),
      visibility: any.fromList(['Public', 'Private'])
    }),
    'child "license" fails because ["license" is required]'
  ));

  suite('vcs', () => {
    test('that `vcs` is required', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string()
      }),
      'child "vcs" fails because ["vcs" is required]'
    ));

    test('that `vcs.host` is required', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        vcs: {}
      }),
      'child "host" fails because ["host" is required]'
    ));

    test('that `vcs.owner` is required', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        vcs: {host: any.word()}
      }),
      'child "owner" fails because ["owner" is required]'
    ));

    test('that `vcs.name` is required', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        vcs: {host: any.word(), owner: any.word()}
      }),
      'child "name" fails because ["name" is required]'
    ));
  });

  test('that `ci` is required', () => assert.throws(
    () => validate({
      projectRoot: any.string(),
      projectName: any.string(),
      visibility: any.fromList(['Public', 'Private']),
      license: any.string(),
      vcs: {host: any.word(), owner: any.word(), name: any.word()}
    }),
    'child "ci" fails because ["ci" is required]'
  ));

  test('that `description` is required', () => assert.throws(
    () => validate({
      projectRoot: any.string(),
      projectName: any.string(),
      visibility: any.fromList(['Public', 'Private']),
      license: any.string(),
      vcs: {host: any.word(), owner: any.word(), name: any.word()},
      ci: any.string()
    }),
    'child "description" fails because ["description" is required]'
  ));

  suite('configs', () => {
    suite('eslint', () => {
      test('that `packageName` is required', () => assert.throws(
        () => validate({
          projectRoot: any.string(),
          projectName: any.string(),
          visibility: any.fromList(['Public', 'Private']),
          license: any.string(),
          vcs: {host: any.word(), owner: any.word(), name: any.word()},
          ci: any.string(),
          description: any.string(),
          configs: {eslint: {}}
        }),
        'child "packageName" fails because ["packageName" is required]'
      ));

      test('that `prefix` is required', () => assert.throws(
        () => validate({
          projectRoot: any.string(),
          projectName: any.string(),
          visibility: any.fromList(['Public', 'Private']),
          license: any.string(),
          vcs: {host: any.word(), owner: any.word(), name: any.word()},
          ci: any.string(),
          description: any.string(),
          configs: {eslint: {packageName: any.string()}}
        }),
        'child "prefix" fails because ["prefix" is required]'
      ));
    });

    suite('commitlint', () => {
      test('that `packageName` is required', () => assert.throws(
        () => validate({
          projectRoot: any.string(),
          projectName: any.string(),
          visibility: any.fromList(['Public', 'Private']),
          license: any.string(),
          vcs: {host: any.word(), owner: any.word(), name: any.word()},
          ci: any.string(),
          description: any.string(),
          configs: {commitlint: {}}
        }),
        'child "packageName" fails because ["packageName" is required]'
      ));

      test('that `name` is required', () => assert.throws(
        () => validate({
          projectRoot: any.string(),
          projectName: any.string(),
          visibility: any.fromList(['Public', 'Private']),
          license: any.string(),
          vcs: {host: any.word(), owner: any.word(), name: any.word()},
          ci: any.string(),
          description: any.string(),
          configs: {commitlint: {packageName: any.string()}}
        }),
        'child "name" fails because ["name" is required]'
      ));
    });

    suite('babel preset', () => {
      test('that `packageName` is required', () => assert.throws(
        () => validate({
          projectRoot: any.string(),
          projectName: any.string(),
          visibility: any.fromList(['Public', 'Private']),
          license: any.string(),
          vcs: {host: any.word(), owner: any.word(), name: any.word()},
          ci: any.string(),
          description: any.string(),
          configs: {babelPreset: {}}
        }),
        'child "packageName" fails because ["packageName" is required]'
      ));

      test('that `name` is required', () => assert.throws(
        () => validate({
          projectRoot: any.string(),
          projectName: any.string(),
          visibility: any.fromList(['Public', 'Private']),
          license: any.string(),
          vcs: {host: any.word(), owner: any.word(), name: any.word()},
          ci: any.string(),
          description: any.string(),
          configs: {babelPreset: {packageName: any.string()}}
        }),
        'child "name" fails because ["name" is required]'
      ));
    });
  });
});
