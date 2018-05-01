import any from '@travi/any';
import {assert} from 'chai';
import buildPackageDetails from '../../src/package';

suite('package details builder', () => {
  const projectName = any.string();
  const visibility = any.fromList(['Private', 'Public']);

  suite('name', () => {
    test('that the package name is defined', () => {
      const packageDetails = buildPackageDetails({projectName, visibility, tests: {}, vcs: {}, author: {}});

      assert.equal(packageDetails.name, projectName);
    });

    test('that the scope is included in the project name when provided', () => {
      const scope = any.word();

      const packageDetails = buildPackageDetails({projectName, visibility, scope, tests: {}, vcs: {}, author: {}});

      assert.equal(packageDetails.name, `@${scope}/${projectName}`);
    });
  });

  suite('description', () => {
    test('that the description is included in the package details', () => {
      const description = any.sentence();

      const packageDetails = buildPackageDetails({description, visibility, tests: {}, vcs: {}, author: {}});

      assert.equal(packageDetails.description, description);
    });
  });

  suite('author', () => {
    test('that the author details are provided', () => {
      const name = any.string();
      const email = any.string();
      const url = any.string();

      const packageDetails = buildPackageDetails({tests: {}, vcs: {}, author: {name, email, url}});

      assert.equal(packageDetails.author, `${name} <${email}> (${url})`);
    });
  });

  suite('private', () => {
    test('that the package is marked as private for an application', () => {
      const packageDetails = buildPackageDetails({
        visibility,
        packageType: 'Application',
        tests: {},
        vcs: {},
        author: {}
      });

      assert.isTrue(packageDetails.private);
    });

    test('that the package is not marked as private for a package', () => {
      const packageDetails = buildPackageDetails({visibility, packageType: 'Package', tests: {}, vcs: {}, author: {}});

      assert.isUndefined(packageDetails.private);
    });
  });

  suite('license', () => {
    test('that the license is defined as provided', () => {
      const license = any.word();

      const packageDetails = buildPackageDetails({license, tests: {}, vcs: {}, author: {}});

      assert.equal(packageDetails.license, license);
    });

    test('that the license is defined as `UNLICENSED` when not provided', () => {
      const packageDetails = buildPackageDetails({tests: {}, vcs: {}, author: {}});

      assert.equal(packageDetails.license, 'UNLICENSED');
    });
  });

  suite('github', () => {
    const repoName = any.word();
    const owner = any.word();

    test('that the repository details are defined', () => {
      const packageDetails = buildPackageDetails({tests: {}, vcs: {host: 'GitHub', name: repoName, owner}, author: {}});

      assert.equal(packageDetails.repository, `${owner}/${repoName}`);
      assert.equal(packageDetails.bugs, `https://github.com/${owner}/${repoName}/issues`);
      assert.equal(packageDetails.homepage, `https://github.com/${owner}/${repoName}#readme`);
    });

    test('that the homepage is set to npm for packages', () => {
      const packageDetails = buildPackageDetails({
        packageType: 'Package',
        projectName,
        tests: {},
        vcs: {host: 'GitHub', name: repoName, owner},
        author: {}
      });

      assert.equal(packageDetails.homepage, `https://npm.im/${projectName}`);
    });

    test('that the npm homepage includes the scope for scoped packages', () => {
      const scope = any.word();

      const packageDetails = buildPackageDetails({
        packageType: 'Package',
        projectName,
        scope,
        tests: {},
        vcs: {host: 'GitHub', name: repoName, owner},
        author: {}
      });

      assert.equal(packageDetails.homepage, `https://npm.im/@${scope}/${projectName}`);
    });
  });

  suite('other vcs', () => {
    test('that project information is not included', () => {
      const packageDetails = buildPackageDetails({
        projectName,
        visibility,
        tests: {},
        vcs: {host: any.word()},
        author: {}
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
        packageType: 'Package',
        tests: {},
        vcs: {},
        author: {}
      });

      assert.deepEqual(packageDetails.publishConfig, {access: 'restricted'});
    });

    test('that access is marked as public for public projects', () => {
      const packageDetails = buildPackageDetails({
        visibility: 'Public',
        packageType: 'Package',
        tests: {},
        vcs: {},
        author: {}
      });

      assert.deepEqual(packageDetails.publishConfig, {access: 'public'});
    });

    test('that access is marked as restricted when visibility is omitted for some reason', () => {
      const packageDetails = buildPackageDetails({packageType: 'Package', tests: {}, vcs: {}, author: {}});

      assert.deepEqual(packageDetails.publishConfig, {access: 'restricted'});
    });
  });

  suite('version', () => {
    test('that `version` is not set for applications', () => {
      const packageDetails = buildPackageDetails({packageType: 'Application', tests: {}, vcs: {}, author: {}});

      assert.isUndefined(packageDetails.version);
    });

    test('that the `version` makes it clear that versioning is handled by semantic-release', () => {
      const packageDetails = buildPackageDetails({packageType: 'Package', tests: {}, vcs: {}, author: {}});

      assert.equal(packageDetails.version, '0.0.0-semantically-released');
    });
  });

  suite('scripts', () => {
    suite('start', () => {
      test('that the `start` script is not defined for a package', () => {
        const packageDetails = buildPackageDetails({packageType: 'Package', tests: {}, vcs: {}, author: {}});

        assert.isUndefined(packageDetails.scripts.start);
      });

      test('that the `start` script runs the built version of the app with the `node` executable', () => {
        const packageDetails = buildPackageDetails({packageType: 'Application', tests: {}, vcs: {}, author: {}});

        assert.equal(packageDetails.scripts.start, './lib/index.js');
      });
    });

    suite('verification', () => {
      test('that the `test` script is defined', () => {
        const packageDetails = buildPackageDetails({tests: {}, vcs: {}, author: {}});

        assert.equal(packageDetails.scripts.test, 'run-s lint:*');
      });

      test('that the `test` script includes running tests when the project will be unit tested', () => {
        const packageDetails = buildPackageDetails({tests: {unit: true}, vcs: {}, author: {}});

        assert.equal(packageDetails.scripts.test, 'run-s lint:* test:*');
      });

      test('that the `test` script includes running tests when the project will be integration tested', () => {
        const packageDetails = buildPackageDetails({tests: {integration: true}, vcs: {}, author: {}});

        assert.equal(packageDetails.scripts.test, 'run-s lint:* test:*');
      });

      suite('tests', () => {
        suite('unit', () => {
          test('that the script is included if the project will be unit tested', () => {
            const packageDetails = buildPackageDetails({tests: {unit: true}, vcs: {}, author: {}});

            assert.equal(packageDetails.scripts['test:unit:base'], 'mocha --recursive test/unit');
            assert.equal(packageDetails.scripts['test:unit'], 'nyc run-s test:unit:base');
          });

          test('that the script is not included if the project will not be unit tested', () => {
            const packageDetails = buildPackageDetails({tests: {unit: false}, vcs: {}, author: {}});

            assert.isUndefined(packageDetails.scripts['test:unit']);
          });
        });

        suite('integration', () => {
          test('that the script is included if the project will be integration tested', () => {
            const packageDetails = buildPackageDetails({tests: {integration: true}, vcs: {}, author: {}});

            assert.equal(
              packageDetails.scripts['test:integration'],
              'cucumber-js test/integration --require-module babel-register --format-options \'{"snippetInterface": "async-await"}\''     // eslint-disable-line max-len
            );
          });

          test('that the script is not included if the project will not be integration tested', () => {
            const packageDetails = buildPackageDetails({tests: {integration: false}, vcs: {}, author: {}});

            assert.isUndefined(packageDetails.scripts['integration:unit']);
          });
        });
      });

      suite('lint', () => {
        test('that javascript is linted', () => {
          const packageDetails = buildPackageDetails({tests: {}, vcs: {}, author: {}});

          assert.equal(packageDetails.scripts['lint:js'], 'eslint . --cache');
        });

        test('that the travis config file is linted when the ci service is travis', () => {
          const packageDetails = buildPackageDetails({tests: {}, vcs: {}, author: {}, ci: 'Travis'});

          assert.equal(packageDetails.scripts['lint:travis'], 'travis lint --no-interactive');
        });

        test('that the travis config file is not linted when the ci service is not travis', () => {
          const packageDetails = buildPackageDetails({tests: {}, vcs: {}, author: {}});

          assert.isUndefined(packageDetails.scripts['lint:travis']);
        });
      });

      suite('coverage', () => {
        test('that a script is included to report coverage to codecov for public projects', () => {
          const packageDetails = buildPackageDetails({tests: {unit: true}, vcs: {}, author: {}, visibility: 'Public'});

          assert.equal(
            packageDetails.scripts['coverage:report'],
            'nyc report --reporter=text-lcov > coverage.lcov && codecov'
          );
        });

        test('that a script is not included to report coverage to codecov for private projects', () => {
          const packageDetails = buildPackageDetails({tests: {unit: true}, vcs: {}, author: {}, visibility: 'Private'});

          assert.isUndefined(packageDetails.scripts['coverage:report']);
        });

        test('that a script is not included to report coverage to codecov if the project wont be unit tested', () => {
          const packageDetails = buildPackageDetails({tests: {}, vcs: {}, author: {}, visibility: 'Public'});

          assert.isUndefined(packageDetails.scripts['coverage:report']);
        });
      });
    });

    suite('greenkeeper', () => {
      test('that the lockfile scripts expose the commands for the ci steps', () => {
        const packageDetails = buildPackageDetails({packageType: 'Application', tests: {}, vcs: {}, author: {}});

        assert.equal(packageDetails.scripts['greenkeeper:update-lockfile'], 'greenkeeper-lockfile-update');
        assert.equal(packageDetails.scripts['greenkeeper:upload-lockfile'], 'greenkeeper-lockfile-upload');
      });
    });
  });

  suite('config', () => {
    test('that commitizen is configured', () => {
      const packageDetails = buildPackageDetails({tests: {}, vcs: {}, author: {}});

      assert.deepEqual(packageDetails.config.commitizen.path, './node_modules/cz-conventional-changelog');
    });
  });
});
