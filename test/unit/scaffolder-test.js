import path from 'path';
import fs from 'mz/fs';
import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import * as prompts from '../../src/prompts/questions';
import * as packageBuilder from '../../src/package';
import * as installer from '../../src/install';
import * as mkdir from '../../third-party-wrappers/make-dir';
import * as optionsValidator from '../../src/options-validator';
import * as ci from '../../src/ci';
import * as eslint from '../../src/config/eslint';
import * as commitizen from '../../src/commitizen';
import * as documentation from '../../src/documentation';
import * as nodeVersionHandler from '../../src/node-version';
import * as badgeDetailsBuilder from '../../src/badges';
import {scaffold} from '../../src/scaffolder';
import {questionNames} from '../../src/prompts/question-names';

suite('javascript project scaffolder', () => {
  let sandbox;
  const options = any.simpleObject();
  const overrides = any.simpleObject();
  const ciServices = any.simpleObject();
  const projectRoot = any.string();
  const projectName = any.string();
  const visibility = any.fromList(['Private', 'Public']);
  const version = any.string();

  setup(() => {
    sandbox = sinon.createSandbox();

    sandbox.stub(fs, 'writeFile');
    sandbox.stub(fs, 'copyFile');
    sandbox.stub(packageBuilder, 'default');
    sandbox.stub(installer, 'default');
    sandbox.stub(prompts, 'prompt');
    sandbox.stub(mkdir, 'default');
    sandbox.stub(optionsValidator, 'validate');
    sandbox.stub(ci, 'default');
    sandbox.stub(eslint, 'default');
    sandbox.stub(commitizen, 'default');
    sandbox.stub(documentation, 'default');
    sandbox.stub(nodeVersionHandler, 'determineLatestVersionOf');
    sandbox.stub(nodeVersionHandler, 'install');
    sandbox.stub(badgeDetailsBuilder, 'default');

    fs.writeFile.resolves();
    fs.copyFile.resolves();
    packageBuilder.default.returns({});
    ci.default.resolves({});
    commitizen.default.withArgs({projectRoot}).resolves({devDependencies: []});
  });

  teardown(() => sandbox.restore());

  suite('config files', () => {
    test('that config files are created', () => {
      const babelPresetName = any.string();
      const remarkPreset = any.string();
      const eslintConfig = any.simpleObject();
      eslint.default
        .withArgs({config: eslintConfig, projectRoot, unitTested: undefined})
        .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}});
      optionsValidator.validate
        .withArgs(options)
        .returns({
          visibility,
          projectRoot,
          vcs: {},
          configs: {babelPreset: {name: babelPresetName}, remark: remarkPreset, eslint: eslintConfig},
          ciServices
        });

      prompts.prompt.resolves({[questionNames.NODE_VERSION_CATEGORY]: any.word()});

      return scaffold(options).then(() => {
        assert.calledWith(
          fs.copyFile,
          path.resolve(__dirname, '../../', 'templates', 'huskyrc.json'),
          `${projectRoot}/.huskyrc.json`
        );
        assert.calledWith(fs.writeFile, `${projectRoot}/.babelrc`, JSON.stringify({presets: [babelPresetName]}));
        assert.calledWith(
          fs.writeFile,
          `${projectRoot}/.remarkrc.js`,
          `exports.plugins = ['${remarkPreset}'];`
        );
      });
    });

    test('that no remark config is created if no remark preset is defined', async () => {
      prompts.prompt.resolves({[questionNames.NODE_VERSION_CATEGORY]: any.word()});
      optionsValidator.validate.withArgs(options).returns({projectRoot, vcs: {}, configs: {}, ciServices});
      eslint.default
        .withArgs({config: undefined, projectRoot, unitTested: undefined})
        .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}});

      await scaffold(options);

      assert.neverCalledWith(fs.writeFile, `${projectRoot}/.remarkrc.js`);
    });

    suite('unit test', () => {
      test('that a canary test is included when the project will be unit tested', async () => {
        const pathToCreatedDirectory = any.string();
        const unitTested = true;
        prompts.prompt.resolves({[questionNames.UNIT_TESTS]: unitTested});
        optionsValidator.validate.withArgs(options).returns({projectRoot, vcs: {}, configs: {}, ciServices});
        eslint.default
          .withArgs({config: undefined, projectRoot, unitTested})
          .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}});
        mkdir.default.withArgs(`${projectRoot}/test/unit`).resolves(pathToCreatedDirectory);

        await scaffold(options);

        assert.calledWith(
          fs.copyFile,
          path.resolve(__dirname, '../../', 'templates', 'canary-test.txt'),
          `${pathToCreatedDirectory}/canary-test.js`
        );
        assert.calledWith(
          fs.copyFile,
          path.resolve(__dirname, '../../', 'templates', 'nycrc.json'),
          `${projectRoot}/.nycrc`
        );
        assert.calledWith(
          fs.copyFile,
          path.resolve(__dirname, '../../', 'templates', 'mocha.opts'),
          `${pathToCreatedDirectory}/../mocha.opts`
        );
        assert.calledWith(
          fs.copyFile,
          path.resolve(__dirname, '../../', 'templates', 'mocha-setup.txt'),
          `${pathToCreatedDirectory}/../mocha-setup.js`
        );
      });

      test('that a canary test is not included when the project will be not unit tested', async () => {
        optionsValidator.validate.withArgs(options).returns({projectRoot, vcs: {}, configs: {}, ciServices});
        const unitTested = false;
        prompts.prompt.resolves({[questionNames.UNIT_TESTS]: unitTested});
        eslint.default
          .withArgs({config: undefined, projectRoot, unitTested})
          .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}});

        await scaffold(options);

        assert.neverCalledWith(mkdir.default, `${projectRoot}/test/unit`);
        assert.neverCalledWith(fs.copyFile, path.resolve(__dirname, '../../', 'templates', 'canary-test.txt'));
        assert.neverCalledWith(fs.copyFile, path.resolve(__dirname, '../../', 'templates', 'nycrc.json'));
        assert.neverCalledWith(fs.copyFile, path.resolve(__dirname, '../../', 'templates', 'mocha.opts'));
      });
    });

    suite('commitlint', () => {
      const commitlintConfigPrefix = any.word();

      test('that the config is added to the root of the project if the package is defined', async () => {
        optionsValidator.validate
          .withArgs(options)
          .returns({projectRoot, vcs: {}, configs: {commitlint: {name: commitlintConfigPrefix}}, ciServices});
        prompts.prompt.resolves({});
        eslint.default
          .withArgs({config: undefined, projectRoot, unitTested: undefined})
          .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}});

        await scaffold(options);

        assert.calledWith(
          fs.writeFile,
          `${projectRoot}/.commitlintrc.js`,
          `module.exports = {extends: ['${commitlintConfigPrefix}']};`
        );
      });

      test('that the config is not added to the root of the project if the package is not defined', async () => {
        optionsValidator.validate.withArgs(options).returns({projectRoot, vcs: {}, configs: {}, ciServices});
        prompts.prompt.resolves({});
        eslint.default
          .withArgs({config: undefined, projectRoot, unitTested: undefined})
          .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}});

        await scaffold(options);

        assert.neverCalledWith(fs.writeFile, `${projectRoot}/.commitlintrc.js`);
      });
    });

    suite('build', () => {
      suite('application', () => {
        test('that rollup is not configured', async () => {
          optionsValidator.validate
            .withArgs(options)
            .returns({visibility, projectRoot, vcs: {}, configs: {}, ciServices});
          prompts.prompt.resolves({[questionNames.PACKAGE_TYPE]: 'Application'});
          eslint.default
            .withArgs({config: undefined, projectRoot, unitTested: undefined})
            .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}});

          await scaffold(options);

          assert.neverCalledWith(fs.copyFile, path.resolve(__dirname, '../../', 'templates', 'rollup.config.js'));
        });
      });

      suite('package', () => {
        test('that the package gets bundled with rollup', async () => {
          optionsValidator.validate
            .withArgs(options)
            .returns({visibility, projectRoot, vcs: {}, configs: {}, ciServices});
          prompts.prompt.resolves({[questionNames.PACKAGE_TYPE]: 'Package'});
          eslint.default
            .withArgs({config: undefined, projectRoot, unitTested: undefined})
            .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}});

          await scaffold(options);

          assert.calledWith(
            fs.copyFile,
            path.resolve(__dirname, '../../', 'templates', 'rollup.config.js'),
            `${projectRoot}/rollup.config.js`
          );
        });
      });
    });
  });

  suite('package', () => {
    test('that the package file is defined', () => {
      const packageDetails = any.simpleObject();
      const scope = any.word();
      const packageType = any.word();
      const license = any.string();
      const tests = {unit: any.boolean(), integration: any.boolean()};
      const vcs = any.simpleObject();
      const authorName = any.string();
      const authorEmail = any.string();
      const authorUrl = any.url();
      const ciService = any.word();
      const description = any.sentence();
      const configs = any.simpleObject();
      optionsValidator.validate
        .withArgs(options)
        .returns({projectRoot, projectName, visibility, license, vcs, description, configs, ciServices});
      prompts.prompt.resolves({
        [questionNames.SCOPE]: scope,
        [questionNames.PACKAGE_TYPE]: packageType,
        [questionNames.UNIT_TESTS]: tests.unit,
        [questionNames.INTEGRATION_TESTS]: tests.integration,
        [questionNames.AUTHOR_NAME]: authorName,
        [questionNames.AUTHOR_EMAIL]: authorEmail,
        [questionNames.AUTHOR_URL]: authorUrl,
        [questionNames.CI_SERVICE]: ciService
      });
      eslint.default
        .withArgs({config: undefined, projectRoot, unitTested: tests.unit})
        .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}});
      packageBuilder.default
        .withArgs({
          projectName,
          visibility,
          scope,
          packageType,
          license,
          tests,
          vcs,
          author: {name: authorName, email: authorEmail, url: authorUrl},
          ci: ciService,
          description,
          configs
        })
        .returns(packageDetails);
      mkdir.default.resolves();

      return scaffold(options).then(() => assert.calledWith(
        fs.writeFile,
        `${projectRoot}/package.json`,
        JSON.stringify(packageDetails)
      ));
    });

    suite('dependencies', () => {
      const eslintDevDependencies = any.listOf(any.string);
      const commitizenDevDependencies = any.listOf(any.string);
      const defaultDependencies = [
        ...eslintDevDependencies,
        ...commitizenDevDependencies,
        'npm-run-all',
        'husky',
        '@babel/register',
        'ban-sensitive-files'
      ];
      const unitTestDependencies = ['mocha', 'chai', 'sinon', 'nyc', '@travi/any'];

      setup(() => {
        eslint.default
          .resolves({devDependencies: eslintDevDependencies, vcsIgnore: {files: any.listOf(any.string)}});
        commitizen.default.resolves({devDependencies: commitizenDevDependencies});
      });

      suite('scripts', () => {
        test('that scripting tools are installed', async () => {
          optionsValidator.validate.withArgs(options).returns({vcs: {}, configs: {}, ciServices});
          prompts.prompt.resolves({});

          await scaffold(options);

          assert.calledWith(installer.default, defaultDependencies);
        });

        test('that the appropriate packages are installed for `Package` type projects', async () => {
          optionsValidator.validate.withArgs(options).returns({vcs: {}, configs: {}, ciServices});
          prompts.prompt.resolves({[questionNames.PACKAGE_TYPE]: 'Package'});

          await scaffold(options);

          assert.calledWith(
            installer.default,
            [...defaultDependencies, 'rimraf', 'rollup', 'rollup-plugin-auto-external']
          );
        });
      });

      suite('lint', () => {
        const commitlintConfigName = any.string();

        test('that the commitlint config is installed when defined', async () => {
          optionsValidator.validate
            .withArgs(options)
            .returns({vcs: {}, configs: {commitlint: {packageName: commitlintConfigName}}, overrides, ciServices});
          prompts.prompt.withArgs(overrides, Object.keys(ciServices)).resolves({});

          await scaffold(options);

          assert.calledWith(installer.default, [...defaultDependencies, commitlintConfigName]);
        });

        test('that the travis-lint is installed when Travis is the chosen ci-service', async () => {
          optionsValidator.validate
            .withArgs(options)
            .returns({vcs: {}, configs: {}, overrides, ciServices});
          prompts.prompt.withArgs(overrides, Object.keys(ciServices)).resolves({[questionNames.CI_SERVICE]: 'Travis'});

          await scaffold(options);

          assert.calledWith(installer.default, [...defaultDependencies, 'travis-lint']);
        });

        test('that remark-cli and the lint preset are installed when the preset is defined', async () => {
          const remarkPreset = any.word();
          optionsValidator.validate
            .withArgs(options)
            .returns({vcs: {}, configs: {remark: remarkPreset}, overrides, ciServices});
          prompts.prompt.withArgs(overrides, Object.keys(ciServices)).resolves({});

          await scaffold(options);

          assert.calledWith(installer.default, [...defaultDependencies, remarkPreset, 'remark-cli']);
        });
      });

      suite('babel', () => {
        const babelPresetName = any.string();

        test('that the babel-preset is installed when defined', async () => {
          optionsValidator.validate
            .withArgs(options)
            .returns({vcs: {}, configs: {babelPreset: {packageName: babelPresetName}}, overrides, ciServices});
          prompts.prompt.withArgs(overrides, Object.keys(ciServices)).resolves({});

          await scaffold(options);

          assert.calledWith(installer.default, [...defaultDependencies, babelPresetName]);
        });
      });

      suite('testing', () => {
        test('that mocha, chai, and sinon are installed when the project will be unit tested', async () => {
          optionsValidator.validate.withArgs(options).returns({vcs: {}, configs: {}, ciServices});
          prompts.prompt.resolves({[questionNames.UNIT_TESTS]: true});
          mkdir.default.resolves();

          await scaffold(options);

          assert.calledWith(installer.default, [...defaultDependencies, ...unitTestDependencies]);
        });

        test('that mocha, chai, and sinon are not installed when the project will not be unit tested', async () => {
          optionsValidator.validate.withArgs(options).returns({vcs: {}, configs: {}, ciServices});
          prompts.prompt.resolves({[questionNames.UNIT_TESTS]: false});

          await scaffold(options);

          assert.calledWith(installer.default, [...defaultDependencies]);
        });

        test('that cucumber and chai are installed when the project will be integration tested', async () => {
          optionsValidator.validate.withArgs(options).returns({vcs: {}, configs: {}, ciServices});
          prompts.prompt.resolves({[questionNames.INTEGRATION_TESTS]: true});

          await scaffold(options);

          assert.calledWith(installer.default, [...defaultDependencies, 'cucumber', 'chai']);
        });

        test('that cucumber and chai are not installed when the project will not be integration tested', async () => {
          optionsValidator.validate.withArgs(options).returns({vcs: {}, configs: {}, ciServices});
          prompts.prompt.resolves({[questionNames.INTEGRATION_TESTS]: false});

          await scaffold(options);

          assert.calledWith(installer.default, [...defaultDependencies]);
        });

        test('that unique dependencies are requested when various reasons overlap', async () => {
          optionsValidator.validate.withArgs(options).returns({vcs: {}, configs: {}, ciServices});
          prompts.prompt.resolves({
            [questionNames.UNIT_TESTS]: true,
            [questionNames.INTEGRATION_TESTS]: true
          });
          mkdir.default.resolves();

          await scaffold(options);

          assert.calledWith(installer.default, [...defaultDependencies, ...unitTestDependencies, 'cucumber']);
        });

        test('that codecov is installed for public projects', async () => {
          optionsValidator.validate.withArgs(options).returns({visibility: 'Public', vcs: {}, configs: {}, ciServices});
          prompts.prompt.resolves({[questionNames.UNIT_TESTS]: true});
          mkdir.default.resolves();

          await scaffold(options);

          assert.calledWith(installer.default, [...defaultDependencies, 'codecov', ...unitTestDependencies]);
        });

        test('that codecov is not installed for private projects', async () => {
          optionsValidator.validate
            .withArgs(options)
            .returns({visibility: 'Private', vcs: {}, configs: {}, ciServices});
          prompts.prompt.resolves({[questionNames.UNIT_TESTS]: true});
          mkdir.default.resolves();

          await scaffold(options);

          assert.calledWith(
            installer.default,
            [...defaultDependencies, 'greenkeeper-lockfile', ...unitTestDependencies]
          );
        });

        test('that codecov is not installed for projects that are not unit tested', async () => {
          optionsValidator.validate.withArgs(options).returns({visibility: 'Public', vcs: {}, configs: {}, ciServices});
          prompts.prompt.resolves({[questionNames.UNIT_TESTS]: false});

          await scaffold(options);

          assert.calledWith(installer.default, defaultDependencies);
        });

        test('that greenkeeper-lockfile is not installed for public projects', async () => {
          optionsValidator.validate.withArgs(options).returns({visibility: 'Public', vcs: {}, configs: {}, ciServices});
          prompts.prompt.resolves({[questionNames.UNIT_TESTS]: false});

          await scaffold(options);

          assert.calledWith(installer.default, defaultDependencies);
        });

        test('that greenkeeper-lockfile is installed for private projects', async () => {
          optionsValidator.validate.withArgs(options).returns({
            visibility: 'Private',
            vcs: {},
            configs: {},
            ciServices
          });
          prompts.prompt.resolves({[questionNames.UNIT_TESTS]: false});

          await scaffold(options);

          assert.calledWith(installer.default, [...defaultDependencies, 'greenkeeper-lockfile']);
        });
      });
    });
  });

  suite('save-exact', () => {
    test('that the project is configured to use exact dependency versions if it is an application', () => {
      optionsValidator.validate
        .withArgs(options)
        .returns({projectRoot, projectName, visibility, vcs: {}, configs: {}, overrides, ciServices});
      prompts.prompt
        .withArgs(overrides, Object.keys(ciServices), visibility)
        .resolves({[questionNames.PACKAGE_TYPE]: 'Application'});
      eslint.default
        .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}});

      return scaffold(options).then(() => assert.calledWith(
        fs.writeFile,
        `${projectRoot}/.npmrc`, 'save-exact=true\n'
      ));
    });

    test('that the project is allowed to use semver ranges if it is a package', () => {
      packageBuilder.default.returns({name: any.word()});
      optionsValidator.validate
        .withArgs(options)
        .returns({projectRoot, projectName, visibility: 'Public', vcs: {}, configs: {}, ciServices});
      prompts.prompt.resolves({[questionNames.PACKAGE_TYPE]: 'Package'});
      eslint.default
        .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}});

      return scaffold(options).then(() => assert.neverCalledWith(fs.writeFile, `${projectRoot}/.npmrc`));
    });
  });

  suite('data passed downstream', () => {
    suite('badges', () => {
      test('that badges are provided', async () => {
        const builtBadges = any.simpleObject();
        const packageType = any.word();
        const packageDetails = any.simpleObject();
        const chosenCiService = any.word();
        const ciService = any.simpleObject();
        const unitTested = any.boolean();
        const vcsDetails = any.simpleObject();
        const versionCategory = any.word();
        optionsValidator.validate
          .withArgs(options)
          .returns({projectRoot, projectName, visibility, vcs: vcsDetails, configs: {}, ciServices});
        prompts.prompt.resolves({
          [questionNames.PACKAGE_TYPE]: packageType,
          [questionNames.CI_SERVICE]: chosenCiService,
          [questionNames.UNIT_TESTS]: unitTested,
          [questionNames.NODE_VERSION_CATEGORY]: versionCategory
        });
        eslint.default
          .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}});
        packageBuilder.default.returns(packageDetails);
        ci.default
          .withArgs(
            ciServices,
            chosenCiService,
            {projectRoot, vcs: vcsDetails, visibility, packageType, nodeVersion: version, tests: {unit: unitTested}}
          )
          .resolves(ciService);
        badgeDetailsBuilder.default
          .withArgs(visibility, packageType, packageDetails, ciService, unitTested, vcsDetails)
          .returns(builtBadges);
        nodeVersionHandler.determineLatestVersionOf.withArgs(versionCategory).returns(version);
        mkdir.default.resolves(any.string());

        const {badges} = await scaffold(options);

        assert.equal(badges, builtBadges);
        assert.calledWith(nodeVersionHandler.install, versionCategory);
      });
    });

    suite('vcs ignore', () => {
      test('that files and directories are defined to be ignored from version control', async () => {
        optionsValidator.validate
          .withArgs(options)
          .returns({projectRoot, projectName, visibility: 'Public', vcs: {}, configs: {eslint: {}}, ciServices});
        const eslintIgnoreFiles = any.listOf(any.string);
        eslint.default
          .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: eslintIgnoreFiles}});
        prompts.prompt.resolves({});

        const {vcsIgnore} = await scaffold(options);

        assert.deepEqual(vcsIgnore.files, [...eslintIgnoreFiles]);

        assert.include(vcsIgnore.directories, '/node_modules/');
        assert.include(vcsIgnore.directories, '/lib/');
        assert.include(vcsIgnore.directories, '/coverage/');
        assert.include(vcsIgnore.directories, '/.nyc_output/');
      });

      test('that the `.env` file is ignored for applications', async () => {
        optionsValidator.validate
          .withArgs(options)
          .returns({projectRoot, projectName, visibility: 'Public', vcs: {}, configs: {eslint: {}}, ciServices});
        const eslintIgnoreFiles = any.listOf(any.string);
        eslint.default
          .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: eslintIgnoreFiles}});
        prompts.prompt.resolves({[questionNames.PACKAGE_TYPE]: 'Application'});

        const {vcsIgnore} = await scaffold(options);

        assert.include(vcsIgnore.files, '.env');
      });
    });

    suite('verification', () => {
      test('that `npm test` is defined as the verification command', async () => {
        optionsValidator.validate
          .withArgs(options)
          .returns({projectRoot, projectName, visibility: any.word(), vcs: {}, configs: {}, ciServices});
        prompts.prompt.resolves({});
        eslint.default
          .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}});

        const {verificationCommand} = await scaffold(options);

        assert.equal(verificationCommand, 'npm test');
      });
    });

    suite('project details', () => {
      test('that details are passed along', async () => {
        const homepage = any.url();
        optionsValidator.validate
          .withArgs(options)
          .returns({projectRoot, projectName, visibility: any.word(), vcs: {}, configs: {}, ciServices});
        prompts.prompt.resolves({});
        eslint.default
          .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}});
        packageBuilder.default.returns({homepage});

        const {projectDetails} = await scaffold(options);

        assert.equal(projectDetails.homepage, homepage);
      });

      test('that details are not passed along if not defined', async () => {
        optionsValidator.validate
          .withArgs(options)
          .returns({projectRoot, projectName, visibility: any.word(), vcs: {}, configs: {}, ciServices});
        prompts.prompt.resolves({});
        packageBuilder.default.returns({});
        eslint.default
          .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}});

        const {projectDetails} = await scaffold(options);

        assert.isUndefined(projectDetails.homepage);
      });
    });

    suite('documentation', () => {
      test('that appropriate documentation is passed along', async () => {
        const docs = any.simpleObject();
        const scope = any.word();
        const packageType = any.word();
        const packageName = any.string();
        prompts.prompt.resolves({
          [questionNames.PACKAGE_TYPE]: packageType,
          [questionNames.SCOPE]: scope
        });
        packageBuilder.default.returns({name: packageName});
        documentation.default.withArgs({packageType, packageName, visibility, scope}).returns(docs);
        optionsValidator.validate
          .returns({projectRoot, projectName, visibility, vcs: {}, configs: {}, ciServices, scope});
        eslint.default
          .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}});

        const {documentation: documentationContent} = await scaffold(options);

        assert.equal(documentationContent, docs);
      });
    });
  });
});
