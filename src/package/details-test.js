import {dialects, projectTypes} from '@form8ion/javascript-core';
import any from '@travi/any';
import {assert} from 'chai';
import buildPackageDetails from './details';

suite('package details builder', () => {
  const packageName = any.string();
  const visibility = any.fromList(['Private', 'Public']);

  test('that the package name is defined', () => {
    const packageDetails = buildPackageDetails({
      packageName,
      visibility,
      tests: {},
      vcs: undefined,
      author: {},
      configs: {},
      scripts: {}
    });

    assert.equal(packageDetails.name, packageName);
  });

  suite('description', () => {
    test('that the description is included in the package details', () => {
      const description = any.sentence();

      const packageDetails = buildPackageDetails({
        description,
        visibility,
        tests: {},
        vcs: {},
        author: {},
        configs: {},
        scripts: {}
      });

      assert.equal(packageDetails.description, description);
    });
  });

  suite('author', () => {
    const name = any.string();
    const email = any.string();
    const url = any.string();

    test('that the author details are provided', () => {
      const packageDetails = buildPackageDetails({
        tests: {},
        vcs: {},
        author: {name, email, url},
        configs: {},
        scripts: {}
      });

      assert.equal(packageDetails.author, `${name} <${email}> (${url})`);
    });

    test('that the angle brackets are not included if email is not provided', () => {
      const packageDetails = buildPackageDetails({
        tests: {},
        vcs: {},
        author: {name, url},
        configs: {},
        scripts: {}
      });

      assert.equal(packageDetails.author, `${name} (${url})`);
    });

    test('that the parenthesis are not included if url is not provided', () => {
      const packageDetails = buildPackageDetails({
        tests: {},
        vcs: {},
        author: {name, email},
        configs: {},
        scripts: {}
      });

      assert.equal(packageDetails.author, `${name} <${email}>`);
    });
  });

  suite('license', () => {
    test('that the license is defined as provided', () => {
      const license = any.word();

      const packageDetails = buildPackageDetails({
        license,
        tests: {},
        vcs: {},
        author: {},
        configs: {},
        scripts: {}
      });

      assert.equal(packageDetails.license, license);
    });
  });

  suite('github', () => {
    const repoName = any.word();
    const owner = any.word();

    test('that the repository details are defined', () => {
      const packageDetails = buildPackageDetails({
        tests: {},
        vcs: {host: 'github', name: repoName, owner},
        author: {},
        configs: {},
        scripts: {}
      });

      assert.equal(packageDetails.repository, `${owner}/${repoName}`);
      assert.equal(packageDetails.bugs, `https://github.com/${owner}/${repoName}/issues`);
      assert.equal(packageDetails.homepage, `https://github.com/${owner}/${repoName}#readme`);
    });

    test('that the homepage is set to npm for packages', () => {
      const packageDetails = buildPackageDetails({
        projectType: projectTypes.PACKAGE,
        packageName,
        tests: {},
        vcs: {host: 'github', name: repoName, owner},
        author: {},
        configs: {},
        scripts: {}
      });

      assert.equal(packageDetails.homepage, `https://npm.im/${packageName}`);
    });

    test('that the path within a parent project is included, when provided', () => {
      const pathWithinParent = any.string();

      const packageDetails = buildPackageDetails({
        tests: {},
        vcs: {host: 'github', name: repoName, owner},
        author: {},
        configs: {},
        scripts: {},
        pathWithinParent
      });

      assert.deepEqual(
        packageDetails.repository,
        {
          type: 'git',
          url: `https://github.com/${owner}/${repoName}.git`,
          directory: pathWithinParent
        }
      );
    });
  });

  suite('other vcs', () => {
    test('that project information is not included', () => {
      const packageDetails = buildPackageDetails({
        projectName: packageName,
        visibility,
        tests: {},
        vcs: {host: any.word()},
        author: {},
        configs: {},
        scripts: {}
      });

      assert.isUndefined(packageDetails.repository);
      assert.isUndefined(packageDetails.bugs);
      assert.isUndefined(packageDetails.homepage);
    });
  });

  suite('scripts', () => {
    suite('verification', () => {
      test('that the `test` script is defined', () => {
        const packageDetails = buildPackageDetails({vcs: {}, author: {}, configs: {}, scripts: any.simpleObject()});

        assert.equal(packageDetails.scripts.test, 'npm-run-all --print-label --parallel lint:*');
      });

      test('that `test` script includes building a generate script for markdown is included', () => {
        const packageDetails = buildPackageDetails({
          vcs: {},
          author: {},
          configs: {},
          scripts: {...any.simpleObject(), 'pregenerate:md': 'run-s build'}
        });

        assert.equal(packageDetails.scripts.test, 'npm-run-all --print-label build --parallel lint:*');
      });

      test('that the `test` script includes running tests when the project will be tested', () => {
        const packageDetails = buildPackageDetails({
          vcs: {},
          author: {},
          configs: {},
          scripts: any.objectWithKeys([
            ...any.listOf(() => any.fromList([any.string(), `test:${any.word}`])),
            `test:${any.word}`
          ])
        });

        assert.equal(packageDetails.scripts.test, 'npm-run-all --print-label --parallel lint:* --parallel test:*');
      });
    });
  });

  suite('package properties', () => {
    test('that the provided properties are included in the generated details', () => {
      const packageProperties = any.simpleObject();

      const packageDetails = buildPackageDetails({
        packageName,
        visibility,
        tests: {},
        vcs: undefined,
        author: {},
        configs: {},
        scripts: {},
        packageProperties
      });

      assert.include(packageDetails, packageProperties);
    });
  });

  suite('module format', () => {
    test('that `commonjs` is used by default', () => {
      const {type} = buildPackageDetails({author: {}, scripts: {}});

      assert.equal(type, 'commonjs');
    });

    test('that `module` is used when the project dialect is ESM', () => {
      const {type} = buildPackageDetails({author: {}, scripts: {}, dialect: dialects.ESM});

      assert.equal(type, 'module');
    });
  });
});
