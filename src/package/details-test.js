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
      contributors: []
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
        contributors: []
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
        contributors: []
      });

      assert.equal(packageDetails.author, `${name} <${email}> (${url})`);
    });

    test('that the angle brackets are not included if email is not provided', () => {
      const packageDetails = buildPackageDetails({
        tests: {},
        vcs: {},
        author: {name, url},
        configs: {},
        contributors: []
      });

      assert.equal(packageDetails.author, `${name} (${url})`);
    });

    test('that the parenthesis are not included if url is not provided', () => {
      const packageDetails = buildPackageDetails({
        tests: {},
        vcs: {},
        author: {name, email},
        configs: {},
        contributors: []
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
        contributors: []
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
        vcs: {host: 'GitHub', name: repoName, owner},
        author: {},
        configs: {},
        contributors: []
      });

      assert.equal(packageDetails.repository, `${owner}/${repoName}`);
      assert.equal(packageDetails.bugs, `https://github.com/${owner}/${repoName}/issues`);
      assert.equal(packageDetails.homepage, `https://github.com/${owner}/${repoName}#readme`);
    });

    test('that the homepage is set to npm for packages', () => {
      const packageDetails = buildPackageDetails({
        projectType: 'Package',
        packageName,
        tests: {},
        vcs: {host: 'GitHub', name: repoName, owner},
        author: {},
        configs: {},
        contributors: []
      });

      assert.equal(packageDetails.homepage, `https://npm.im/${packageName}`);
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
        contributors: []
      });

      assert.isUndefined(packageDetails.repository);
      assert.isUndefined(packageDetails.bugs);
      assert.isUndefined(packageDetails.homepage);
    });
  });

  suite('scripts', () => {
    test('that scripts from each contributor are included', () => {
      const contributors = any.listOf(() => ({...any.simpleObject(), scripts: any.simpleObject()}));
      const scriptsFromAllContributors = contributors
        .map(contributor => contributor.scripts)
        .reduce((acc, scripts) => ({...acc, ...scripts}), {});

      const packageDetails = buildPackageDetails({
        projectType: any.word(),
        tests: {},
        vcs: {},
        author: {},
        configs: {},
        contributors
      });

      assert.deepEqual(
        packageDetails.scripts,
        {
          test: 'npm-run-all --print-label --parallel lint:*',
          ...scriptsFromAllContributors
        }
      );
    });

    suite('verification', () => {
      test('that the `test` script is defined', () => {
        const packageDetails = buildPackageDetails({tests: {}, vcs: {}, author: {}, configs: {}, contributors: []});

        assert.equal(packageDetails.scripts.test, 'npm-run-all --print-label --parallel lint:*');
      });

      test('that the `test` script includes running tests when the project will be unit tested', () => {
        const packageDetails = buildPackageDetails({
          tests: {unit: true},
          vcs: {},
          author: {},
          configs: {},
          contributors: []
        });

        assert.equal(packageDetails.scripts.test, 'npm-run-all --print-label --parallel lint:* --parallel test:*');
      });

      test('that the `test` script includes running tests when the project will be integration tested', () => {
        const packageDetails = buildPackageDetails({
          tests: {integration: true},
          vcs: {},
          author: {},
          configs: {},
          contributors: []
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
        contributors: [],
        packageProperties
      });

      assert.include(packageDetails, packageProperties);
    });
  });
});
