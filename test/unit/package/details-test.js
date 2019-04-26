import any from '@travi/any';
import {assert} from 'chai';
import buildPackageDetails from '../../../src/package/details';

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

  suite('main/module', () => {
    suite('application', () => {
      test('that these properties aer not defined for applications', () => {
        const packageDetails = buildPackageDetails({
          tests: {},
          vcs: {},
          author: {},
          projectType: 'Application',
          configs: {},
          contributors: []
        });

        assert.isUndefined(packageDetails.main);
        assert.isUndefined(packageDetails.module);
      });
    });

    suite('package', () => {
      test('that `main` and `module` are defined for package consumers', () => {
        const packageDetails = buildPackageDetails({
          tests: {},
          vcs: {},
          author: {},
          projectType: 'Package',
          configs: {},
          contributors: []
        });

        assert.equal(packageDetails.main, 'lib/index.cjs.js');
        assert.equal(packageDetails.module, 'lib/index.es.js');
      });
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

  suite('private', () => {
    test('that the package is marked as private for an application', () => {
      const packageDetails = buildPackageDetails({
        visibility,
        projectType: 'Application',
        tests: {},
        vcs: {},
        author: {},
        configs: {},
        contributors: []
      });

      assert.isTrue(packageDetails.private);
    });

    test('that the package is not marked as private for a package', () => {
      const packageDetails = buildPackageDetails({
        visibility,
        projectType: 'Package',
        tests: {},
        vcs: {},
        author: {},
        configs: {},
        contributors: []
      });

      assert.isUndefined(packageDetails.private);
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

  suite('publish config', () => {
    test('that access is marked as restricted for private projects', () => {
      const packageDetails = buildPackageDetails({
        visibility: 'Private',
        projectType: 'Package',
        tests: {},
        vcs: {},
        author: {},
        configs: {},
        contributors: []
      });

      assert.deepEqual(packageDetails.publishConfig, {access: 'restricted'});
    });

    test('that access is marked as public for public projects', () => {
      const packageDetails = buildPackageDetails({
        visibility: 'Public',
        projectType: 'Package',
        tests: {},
        vcs: {},
        author: {},
        configs: {},
        contributors: []
      });

      assert.deepEqual(packageDetails.publishConfig, {access: 'public'});
    });

    test('that access is marked as restricted when visibility is omitted for some reason', () => {
      const packageDetails = buildPackageDetails({
        projectType: 'Package',
        tests: {},
        vcs: {},
        author: {},
        configs: {},
        contributors: []
      });

      assert.deepEqual(packageDetails.publishConfig, {access: 'restricted'});
    });
  });

  suite('version', () => {
    test('that `version` is not set for applications', () => {
      const packageDetails = buildPackageDetails({
        projectType: 'Application',
        tests: {},
        vcs: {},
        author: {},
        configs: {},
        contributors: []
      });

      assert.isUndefined(packageDetails.version);
    });

    test('that the `version` makes it clear that versioning is handled by semantic-release', () => {
      const packageDetails = buildPackageDetails({
        projectType: 'Package',
        tests: {},
        vcs: {},
        author: {},
        configs: {},
        contributors: []
      });

      assert.equal(packageDetails.version, '0.0.0-semantically-released');
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

    suite('build', () => {
      suite('application', () => {
        test('that rollup is not used', () => {
          const packageDetails = buildPackageDetails({
            tests: {},
            vcs: {},
            author: {},
            projectType: 'Application',
            configs: {},
            contributors: []
          });

          assert.isUndefined(packageDetails.scripts.build);
          assert.isUndefined(packageDetails.scripts['build:js']);
          assert.isUndefined(packageDetails.scripts.watch);
        });
      });
    });

    suite('publish', () => {
      suite('application', () => {
        test('that publishing is not configured', () => {
          const packageDetails = buildPackageDetails({
            tests: {},
            vcs: {},
            author: {},
            projectType: 'Application',
            configs: {},
            contributors: []
          });

          assert.isUndefined(packageDetails.scripts.prepack);
          assert.isUndefined(packageDetails.files);
        });
      });

      suite('package', () => {
        test('that the package is marked as side-effects free', () => {
          const packageDetails = buildPackageDetails({
            tests: {},
            vcs: {},
            author: {},
            projectType: 'Package',
            configs: {},
            contributors: []
          });

          assert.isFalse(packageDetails.sideEffects);
        });

        test('that the lib/ directory is whitelisted for inclusion in the published package', () => {
          const packageDetails = buildPackageDetails({
            tests: {},
            vcs: {},
            author: {},
            projectType: 'Package',
            configs: {},
            contributors: []
          });

          assert.deepEqual(packageDetails.files, ['lib/']);
        });
      });
    });
  });
});
