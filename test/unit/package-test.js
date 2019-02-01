import any from '@travi/any';
import {assert} from 'chai';
import buildPackageDetails from '../../src/package';

suite('package details builder', () => {
  const projectName = any.string();
  const visibility = any.fromList(['Private', 'Public']);

  suite('name', () => {
    test('that the package name is defined', () => {
      const packageDetails = buildPackageDetails({
        projectName,
        visibility,
        tests: {},
        vcs: {},
        author: {},
        configs: {}
      });

      assert.equal(packageDetails.name, projectName);
    });

    test('that the scope is included in the project name when provided', () => {
      const scope = any.word();

      const packageDetails = buildPackageDetails({
        projectName,
        visibility,
        scope,
        tests: {},
        vcs: {},
        author: {},
        configs: {}
      });

      assert.equal(packageDetails.name, `@${scope}/${projectName}`);
    });
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
        configs: {}
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
          packageType: 'Application',
          configs: {}
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
          packageType: 'Package',
          configs: {}
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
      const packageDetails = buildPackageDetails({tests: {}, vcs: {}, author: {name, email, url}, configs: {}});

      assert.equal(packageDetails.author, `${name} <${email}> (${url})`);
    });

    test('that the angle brackets are not included if email is not provided', () => {
      const packageDetails = buildPackageDetails({tests: {}, vcs: {}, author: {name, url}, configs: {}});

      assert.equal(packageDetails.author, `${name} (${url})`);
    });

    test('that the parenthesis are not included if url is not provided', () => {
      const packageDetails = buildPackageDetails({tests: {}, vcs: {}, author: {name, email}, configs: {}});

      assert.equal(packageDetails.author, `${name} <${email}>`);
    });
  });

  suite('private', () => {
    test('that the package is marked as private for an application', () => {
      const packageDetails = buildPackageDetails({
        visibility,
        packageType: 'Application',
        tests: {},
        vcs: {},
        author: {},
        configs: {}
      });

      assert.isTrue(packageDetails.private);
    });

    test('that the package is not marked as private for a package', () => {
      const packageDetails = buildPackageDetails({
        visibility,
        packageType: 'Package',
        tests: {},
        vcs: {},
        author: {},
        configs: {}
      });

      assert.isUndefined(packageDetails.private);
    });
  });

  suite('license', () => {
    test('that the license is defined as provided', () => {
      const license = any.word();

      const packageDetails = buildPackageDetails({license, tests: {}, vcs: {}, author: {}, configs: {}});

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
        configs: {}
      });

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
        author: {},
        configs: {}
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
        author: {},
        configs: {}
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
        author: {},
        configs: {}
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
        author: {},
        configs: {}
      });

      assert.deepEqual(packageDetails.publishConfig, {access: 'restricted'});
    });

    test('that access is marked as public for public projects', () => {
      const packageDetails = buildPackageDetails({
        visibility: 'Public',
        packageType: 'Package',
        tests: {},
        vcs: {},
        author: {},
        configs: {}
      });

      assert.deepEqual(packageDetails.publishConfig, {access: 'public'});
    });

    test('that access is marked as restricted when visibility is omitted for some reason', () => {
      const packageDetails = buildPackageDetails({packageType: 'Package', tests: {}, vcs: {}, author: {}, configs: {}});

      assert.deepEqual(packageDetails.publishConfig, {access: 'restricted'});
    });
  });

  suite('version', () => {
    test('that `version` is not set for applications', () => {
      const packageDetails = buildPackageDetails({
        packageType: 'Application',
        tests: {},
        vcs: {},
        author: {},
        configs: {}
      });

      assert.isUndefined(packageDetails.version);
    });

    test('that the `version` makes it clear that versioning is handled by semantic-release', () => {
      const packageDetails = buildPackageDetails({packageType: 'Package', tests: {}, vcs: {}, author: {}, configs: {}});

      assert.equal(packageDetails.version, '0.0.0-semantically-released');
    });
  });

  suite('scripts', () => {
    suite('start', () => {
      test('that the `start` script is not defined for a package', () => {
        const packageDetails = buildPackageDetails({
          packageType: 'Package',
          tests: {},
          vcs: {},
          author: {},
          configs: {}
        });

        assert.isUndefined(packageDetails.scripts.start);
      });

      test('that the `start` script runs the built version of the app with the `node` executable', () => {
        const packageDetails = buildPackageDetails({
          packageType: 'Application',
          tests: {},
          vcs: {},
          author: {},
          configs: {}
        });

        assert.equal(packageDetails.scripts.start, './lib/index.js');
      });
    });

    suite('verification', () => {
      test('that the `test` script is defined', () => {
        const packageDetails = buildPackageDetails({tests: {}, vcs: {}, author: {}, configs: {}});

        assert.equal(packageDetails.scripts.test, 'npm-run-all --print-label --parallel lint:*');
      });

      test('that the `test` script includes running tests when the project will be unit tested', () => {
        const packageDetails = buildPackageDetails({tests: {unit: true}, vcs: {}, author: {}, configs: {}});

        assert.equal(packageDetails.scripts.test, 'npm-run-all --print-label --parallel lint:* --parallel test:*');
      });

      test('that the `test` script includes running tests when the project will be integration tested', () => {
        const packageDetails = buildPackageDetails({tests: {integration: true}, vcs: {}, author: {}, configs: {}});

        assert.equal(packageDetails.scripts.test, 'npm-run-all --print-label --parallel lint:* --parallel test:*');
      });

      suite('clean', () => {
        test('that no clean script is defined if the package-type is not `Package`', () => {
          const packageDetails = buildPackageDetails({
            tests: {},
            vcs: {},
            author: {},
            packageType: any.word(),
            configs: {}
          });

          assert.isUndefined(packageDetails.scripts.clean);
        });

        test('that the clean script removes the `lib/` directory if the package-type is `Package`', () => {
          const packageDetails = buildPackageDetails({
            tests: {},
            vcs: {},
            author: {},
            packageType: 'Package',
            configs: {}
          });

          assert.equal(packageDetails.scripts.clean, 'rimraf lib/');
        });
      });

      suite('tests', () => {
        suite('unit', () => {
          test('that the script is included if the project will be unit tested', () => {
            const packageDetails = buildPackageDetails({tests: {unit: true}, vcs: {}, author: {}, configs: {}});

            assert.equal(packageDetails.scripts['test:unit:base'], 'mocha --recursive test/unit');
            assert.equal(packageDetails.scripts['test:unit'], 'nyc run-s test:unit:base');
          });

          test('that the script is not included if the project will not be unit tested', () => {
            const packageDetails = buildPackageDetails({tests: {unit: false}, vcs: {}, author: {}, configs: {}});

            assert.isUndefined(packageDetails.scripts['test:unit']);
          });
        });

        suite('integration', () => {
          test('that the script is included if the project will be integration tested', () => {
            const packageDetails = buildPackageDetails({tests: {integration: true}, vcs: {}, author: {}, configs: {}});

            assert.equal(
              packageDetails.scripts['test:integration'],
              'cucumber-js test/integration --require-module @babel/register --format-options \'{"snippetInterface": "async-await"}\''     // eslint-disable-line max-len
            );
          });

          test('that the script is not included if the project will not be integration tested', () => {
            const packageDetails = buildPackageDetails({tests: {integration: false}, vcs: {}, author: {}, configs: {}});

            assert.isUndefined(packageDetails.scripts['integration:unit']);
          });
        });
      });

      suite('lint', () => {
        test('that markdown is not linted if a preset is not defined', () => {
          const packageDetails = buildPackageDetails({tests: {}, vcs: {}, author: {}, configs: {}});

          assert.isUndefined(packageDetails.scripts['lint:md']);
        });

        test('that markdown is linted if a preset is defined', () => {
          const packageDetails = buildPackageDetails({
            tests: {},
            vcs: {},
            author: {},
            configs: {remark: any.string()}
          });

          assert.equal(packageDetails.scripts['lint:md'], 'remark . --frail');
        });

        test('that javascript is linted', () => {
          const packageDetails = buildPackageDetails({tests: {}, vcs: {}, author: {}, configs: {}});

          assert.equal(packageDetails.scripts['lint:js'], 'eslint . --cache');
        });

        test('that sensitive files are prevented from being committed', () => {
          const packageDetails = buildPackageDetails({tests: {}, vcs: {}, author: {}, configs: {}});

          assert.equal(packageDetails.scripts['lint:sensitive'], 'ban');
        });

        test('that the travis config file is linted when the ci service is travis', () => {
          const packageDetails = buildPackageDetails({tests: {}, vcs: {}, author: {}, ci: 'Travis', configs: {}});

          assert.equal(packageDetails.scripts['lint:travis'], 'travis-lint .travis.yml');
        });

        test('that the travis config file is not linted when the ci service is not travis', () => {
          const packageDetails = buildPackageDetails({tests: {}, vcs: {}, author: {}, configs: {}});

          assert.isUndefined(packageDetails.scripts['lint:travis']);
        });
      });

      suite('coverage', () => {
        test('that a script is included to report coverage to codecov for public projects', () => {
          const packageDetails = buildPackageDetails({
            tests: {unit: true},
            vcs: {},
            author: {},
            visibility: 'Public',
            configs: {}
          });

          assert.equal(
            packageDetails.scripts['coverage:report'],
            'nyc report --reporter=text-lcov > coverage.lcov && codecov'
          );
        });

        test('that a script is not included to report coverage to codecov for private projects', () => {
          const packageDetails = buildPackageDetails({
            tests: {unit: true},
            vcs: {},
            author: {},
            visibility: 'Private',
            configs: {}
          });

          assert.isUndefined(packageDetails.scripts['coverage:report']);
        });

        test('that a script is not included to report coverage to codecov if the project wont be unit tested', () => {
          const packageDetails = buildPackageDetails({
            tests: {},
            vcs: {},
            author: {},
            visibility: 'Public',
            configs: {}
          });

          assert.isUndefined(packageDetails.scripts['coverage:report']);
        });
      });
    });

    suite('build', () => {
      suite('application', () => {
        test('that rollup is not used', () => {
          const packageDetails = buildPackageDetails({
            tests: {},
            vcs: {},
            author: {},
            packageType: 'Application',
            configs: {}
          });

          assert.isUndefined(packageDetails.scripts.build);
          assert.isUndefined(packageDetails.scripts['build:js']);
          assert.isUndefined(packageDetails.scripts.watch);
        });
      });

      suite('package', () => {
        test('that the rollup build is scripted', () => {
          const packageDetails = buildPackageDetails({
            tests: {},
            vcs: {},
            author: {},
            packageType: 'Package',
            configs: {}
          });

          assert.equal(packageDetails.scripts.build, 'run-s clean build:*');
          assert.equal(packageDetails.scripts['build:js'], 'rollup -c');
          assert.equal(packageDetails.scripts.watch, 'run-s \'build:js -- --watch\'');
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
            packageType: 'Application',
            configs: {}
          });

          assert.isUndefined(packageDetails.scripts.prepack);
          assert.isUndefined(packageDetails.files);
        });
      });

      suite('package', () => {
        test('that the build is executed before publishing', () => {
          const packageDetails = buildPackageDetails({
            tests: {},
            vcs: {},
            author: {},
            packageType: 'Package',
            configs: {}
          });

          assert.equal(packageDetails.scripts.prepack, 'run-s build');
        });

        test('that the package is marked as side-effects free', () => {
          const packageDetails = buildPackageDetails({
            tests: {},
            vcs: {},
            author: {},
            packageType: 'Package',
            configs: {}
          });

          assert.isFalse(packageDetails.sideEffects);
        });

        test('that the lib/ directory is whitelisted for inclusion in the published package', () => {
          const packageDetails = buildPackageDetails({
            tests: {},
            vcs: {},
            author: {},
            packageType: 'Package',
            configs: {}
          });

          assert.deepEqual(packageDetails.files, ['lib/']);
        });
      });
    });

    suite('greenkeeper', () => {
      test('that the lockfile scripts expose the commands for the ci steps on private projects', () => {
        const packageDetails = buildPackageDetails({
          packageType: 'Application',
          tests: {},
          vcs: {},
          author: {},
          visibility: 'Private',
          configs: {}
        });

        assert.equal(packageDetails.scripts['greenkeeper:update-lockfile'], 'greenkeeper-lockfile-update');
        assert.equal(packageDetails.scripts['greenkeeper:upload-lockfile'], 'greenkeeper-lockfile-upload');
      });

      test('that the lockfile scripts are not exposed on public projects', () => {
        const packageDetails = buildPackageDetails({
          packageType: 'Application',
          tests: {},
          vcs: {},
          author: {},
          visibility: 'Public',
          configs: {}
        });

        assert.notProperty(packageDetails.scripts, 'greenkeeper:update-lockfile');
        assert.notProperty(packageDetails.scripts, 'greenkeeper:upload-lockfile');
      });
    });
  });
});
