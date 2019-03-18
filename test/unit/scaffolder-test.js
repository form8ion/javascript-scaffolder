import path from 'path';
import fs from 'mz/fs';
import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import * as prompts from '../../src/prompts/questions';
import * as packageBuilder from '../../src/package/details';
import * as installer from '../../src/package/install';
import * as mkdir from '../../third-party-wrappers/make-dir';
import * as optionsValidator from '../../src/options-validator';
import * as ci from '../../src/ci';
import * as testing from '../../src/testing/scaffolder';
import * as host from '../../src/host';
import * as babel from '../../src/config/babel';
import * as linting from '../../src/linting/scaffolder';
import * as husky from '../../src/config/husky';
import * as npmConfig from '../../src/config/npm';
import * as commitizen from '../../src/config/commitizen';
import * as documentation from '../../src/documentation';
import * as nodeVersionHandler from '../../src/node-version';
import * as badgeDetailsBuilder from '../../src/badges';
import * as vcsIgnoresBuilder from '../../src/vcs-ignore';
import * as commitConvention from '../../src/commit-convention/scaffolder';
import * as dependencyInstaller from '../../src/package/dependencies';
import {scaffold} from '../../src/scaffolder';
import {questionNames} from '../../src/prompts/question-names';

suite('javascript project scaffolder', () => {
  let sandbox;
  const options = any.simpleObject();
  const ciServices = any.simpleObject();
  const hosts = any.simpleObject();
  const projectRoot = any.string();
  const projectName = any.string();
  const visibility = any.fromList(['Private', 'Public']);
  const version = any.string();
  const commonDependency = any.word();
  const testingDevDependenciesWithoutCommon = any.listOf(any.string);
  const testingDevDependencies = [...testingDevDependenciesWithoutCommon, commonDependency];
  const testingScripts = any.simpleObject();
  const babelDevDependenciesWithoutCommon = any.listOf(any.string);
  const babelDevDependencies = [...babelDevDependenciesWithoutCommon, commonDependency];
  const ciServiceDevDependencies = any.listOf(any.string);
  const commitConventionDevDependencies = any.listOf(any.string);
  const hostDirectoriesToIgnore = any.listOf(any.string);
  const hostResults = {vcsIgnore: {directories: hostDirectoriesToIgnore}, devDependencies: []};
  const babelResults = {devDependencies: babelDevDependencies};
  const commitizenResults = any.simpleObject();
  const huskyResults = any.simpleObject();
  const chosenHost = any.word();

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
    sandbox.stub(testing, 'default');
    sandbox.stub(host, 'default');
    sandbox.stub(babel, 'default');
    sandbox.stub(linting, 'default');
    sandbox.stub(husky, 'default');
    sandbox.stub(npmConfig, 'default');
    sandbox.stub(commitizen, 'default');
    sandbox.stub(documentation, 'default');
    sandbox.stub(nodeVersionHandler, 'determineLatestVersionOf');
    sandbox.stub(nodeVersionHandler, 'install');
    sandbox.stub(badgeDetailsBuilder, 'default');
    sandbox.stub(vcsIgnoresBuilder, 'default');
    sandbox.stub(commitConvention, 'default');
    sandbox.stub(dependencyInstaller, 'default');

    fs.writeFile.resolves();
    fs.copyFile.resolves();
    packageBuilder.default.returns({});
    ci.default.resolves({devDependencies: []});
    host.default.withArgs(hosts, chosenHost).resolves(hostResults);
    testing.default
      .withArgs({projectRoot, tests: {unit: undefined, integration: undefined}, visibility: undefined})
      .resolves({devDependencies: testingDevDependencies});
    commitizen.default.withArgs({projectRoot}).resolves(commitizenResults);
    babel.default.withArgs({projectRoot, preset: undefined}).resolves({devDependencies: babelDevDependencies});
    husky.default.withArgs({projectRoot}).resolves(huskyResults);
  });

  teardown(() => sandbox.restore());

  suite('config files', () => {
    test('that config files are created', () => {
      const babelPresetName = any.string();
      const babelPreset = {name: babelPresetName};
      const remarkPreset = any.string();
      const eslintConfig = any.simpleObject();
      const projectType = any.word();
      const tests = {unit: undefined, integration: undefined};
      const configs = {babelPreset, remark: remarkPreset, eslint: eslintConfig};
      linting.default
        .withArgs({configs, projectRoot, tests})
        .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}});
      babel.default.withArgs({projectRoot, preset: babelPreset}).resolves(babelResults);
      npmConfig.default.resolves();
      testing.default
        .withArgs({projectRoot, tests, visibility})
        .resolves({devDependencies: testingDevDependencies});
      commitConvention.default
        .withArgs({projectRoot, configs})
        .resolves({devDependencies: commitConventionDevDependencies});
      optionsValidator.validate
        .withArgs(options)
        .returns({
          visibility,
          projectRoot,
          vcs: {},
          configs,
          ciServices
        });

      prompts.prompt.resolves({
        [questionNames.NODE_VERSION_CATEGORY]: any.word(),
        [questionNames.PROJECT_TYPE]: projectType
      });

      return scaffold(options).then(() => {
        assert.calledWith(babel.default, {preset: babelPreset, projectRoot});
        assert.calledWith(npmConfig.default, {projectRoot, projectType});
      });
    });

    test('that no remark config is created if no remark preset is defined', async () => {
      const integrationTested = any.boolean();
      const unitTested = any.boolean();
      const configs = any.simpleObject();
      const tests = {unit: unitTested, integration: integrationTested};
      prompts.prompt.resolves({
        [questionNames.NODE_VERSION_CATEGORY]: any.word(),
        [questionNames.UNIT_TESTS]: unitTested,
        [questionNames.INTEGRATION_TESTS]: integrationTested
      });
      optionsValidator.validate.withArgs(options).returns({projectRoot, vcs: {}, configs, ciServices, visibility});
      linting.default
        .withArgs({configs, projectRoot, tests})
        .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}});
      testing.default
        .withArgs({projectRoot, tests, visibility})
        .resolves({devDependencies: []});
      commitConvention.default
        .withArgs({projectRoot, configs})
        .resolves({devDependencies: commitConventionDevDependencies});

      await scaffold(options);

      assert.neverCalledWith(fs.writeFile, `${projectRoot}/.remarkrc.js`);
    });

    suite('build', () => {
      suite('application', () => {
        test('that rollup is not configured', async () => {
          const configs = any.simpleObject();
          optionsValidator.validate
            .withArgs(options)
            .returns({visibility, projectRoot, vcs: {}, configs, ciServices});
          prompts.prompt.resolves({[questionNames.PROJECT_TYPE]: 'Application'});
          linting.default
            .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}});
          testing.default
            .withArgs({projectRoot, tests: {unit: undefined, integration: undefined}, visibility})
            .resolves({devDependencies: testingDevDependencies});
          commitConvention.default
            .withArgs({projectRoot, configs})
            .resolves({devDependencies: commitConventionDevDependencies});

          await scaffold(options);

          assert.neverCalledWith(fs.copyFile, path.resolve(__dirname, '../../', 'templates', 'rollup.config.js'));
        });
      });

      suite('package', () => {
        test('that the package gets bundled with rollup', async () => {
          const configs = any.simpleObject();
          optionsValidator.validate
            .withArgs(options)
            .returns({visibility, projectRoot, vcs: {}, configs, ciServices});
          prompts.prompt.resolves({[questionNames.PROJECT_TYPE]: 'Package'});
          linting.default
            .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}});
          testing.default
            .withArgs({projectRoot, tests: {unit: undefined, integration: undefined}, visibility})
            .resolves({devDependencies: testingDevDependencies});
          commitConvention.default
            .withArgs({projectRoot, configs})
            .resolves({devDependencies: commitConventionDevDependencies});

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
    test('that the package file is defined', async () => {
      const packageDetails = any.simpleObject();
      const scope = any.word();
      const projectType = any.word();
      const license = any.string();
      const tests = {unit: any.boolean(), integration: any.boolean()};
      const vcs = any.simpleObject();
      const authorName = any.string();
      const authorEmail = any.string();
      const authorUrl = any.url();
      const ciServiceScripts = any.simpleObject();
      const chosenCiService = any.word();
      const description = any.sentence();
      const configs = any.simpleObject();
      const ciServiceResults = {
        ...any.simpleObject(),
        devDependencies: ciServiceDevDependencies,
        scripts: ciServiceScripts
      };
      const commitConventionResults = any.simpleObject();
      const testingResults = {devDependencies: testingDevDependencies, scripts: testingScripts};
      const lintingResults = {devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}};
      const contributors = [
        hostResults,
        testingResults,
        lintingResults,
        babelResults,
        commitizenResults,
        commitConventionResults,
        huskyResults,
        ciServiceResults
      ];
      testing.default
        .withArgs({projectRoot, tests: {unit: tests.unit, integration: tests.integration}, visibility})
        .resolves(testingResults);
      optionsValidator.validate
        .withArgs(options)
        .returns({projectRoot, projectName, visibility, license, vcs, description, configs, ciServices, hosts});
      prompts.prompt.resolves({
        [questionNames.SCOPE]: scope,
        [questionNames.PROJECT_TYPE]: projectType,
        [questionNames.UNIT_TESTS]: tests.unit,
        [questionNames.INTEGRATION_TESTS]: tests.integration,
        [questionNames.AUTHOR_NAME]: authorName,
        [questionNames.AUTHOR_EMAIL]: authorEmail,
        [questionNames.AUTHOR_URL]: authorUrl,
        [questionNames.CI_SERVICE]: chosenCiService,
        [questionNames.HOST]: chosenHost
      });
      ci.default.resolves(ciServiceResults);
      linting.default.resolves(lintingResults);
      commitConvention.default.withArgs({projectRoot, configs}).resolves(commitConventionResults);
      packageBuilder.default
        .withArgs({
          projectName,
          visibility,
          scope,
          projectType,
          license,
          tests,
          vcs,
          author: {name: authorName, email: authorEmail, url: authorUrl},
          ci: chosenCiService,
          description,
          configs,
          contributors
        })
        .returns(packageDetails);
      mkdir.default.resolves();

      await scaffold(options);

      assert.calledWith(fs.writeFile, `${projectRoot}/package.json`, JSON.stringify(packageDetails));
      assert.calledWith(dependencyInstaller.default, {projectType, contributors});
    });
  });

  suite('data passed downstream', () => {
    suite('badges', () => {
      test('that badges are provided', async () => {
        const builtBadges = any.simpleObject();
        const projectType = any.word();
        const packageName = any.string();
        const packageDetails = {...any.simpleObject(), name: packageName};
        const chosenCiService = any.word();
        const ciService = {...any.simpleObject(), devDependencies: ciServiceDevDependencies};
        const unitTested = any.boolean();
        const vcsDetails = any.simpleObject();
        const versionCategory = any.word();
        testing.default
          .withArgs({projectRoot, tests: {unit: unitTested, integration: undefined}})
          .resolves({devDependencies: testingDevDependencies});
        optionsValidator.validate
          .withArgs(options)
          .returns({projectRoot, projectName, visibility, vcs: vcsDetails, configs: {}, ciServices});
        prompts.prompt.resolves({
          [questionNames.PROJECT_TYPE]: projectType,
          [questionNames.CI_SERVICE]: chosenCiService,
          [questionNames.UNIT_TESTS]: unitTested,
          [questionNames.NODE_VERSION_CATEGORY]: versionCategory
        });
        linting.default
          .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}});
        testing.default
          .withArgs({projectRoot, tests: {unit: unitTested, integration: undefined}, visibility})
          .resolves({devDependencies: testingDevDependencies});
        packageBuilder.default.returns(packageDetails);
        commitConvention.default.resolves({devDependencies: commitConventionDevDependencies});
        ci.default
          .withArgs(
            ciServices,
            chosenCiService,
            {
              projectRoot,
              vcs: vcsDetails,
              visibility,
              packageType: projectType,
              nodeVersion: version,
              tests: {unit: unitTested, integration: undefined}
            }
          )
          .resolves(ciService);
        badgeDetailsBuilder.default
          .withArgs(visibility, projectType, packageName, ciService, unitTested, vcsDetails)
          .returns(builtBadges);
        nodeVersionHandler.determineLatestVersionOf.withArgs(versionCategory).returns(version);
        mkdir.default.resolves(any.string());

        const {badges} = await scaffold(options);

        assert.equal(badges, builtBadges);
        assert.calledWith(nodeVersionHandler.install, versionCategory);
      });
    });

    suite('vcs ignore', () => {
      test('that ignores are defined', async () => {
        const lintingResults = {devDependencies: [], vcsIgnore: {files: []}};
        const testingResults = {devDependencies: testingDevDependencies};
        const ignores = any.simpleObject();
        const projectType = any.word();
        prompts.prompt.resolves({[questionNames.PROJECT_TYPE]: projectType});
        optionsValidator.validate
          .withArgs(options)
          .returns({projectRoot, projectName, visibility: 'Public', vcs: {}, configs: {eslint: {}}, ciServices});
        testing.default
          .withArgs({projectRoot, tests: {unit: undefined, integration: undefined}, visibility: 'Public'})
          .resolves(testingResults);
        linting.default.resolves(lintingResults);
        host.default.resolves(hostResults);
        vcsIgnoresBuilder.default
          .withArgs({host: hostResults, linting: lintingResults, testing: testingResults, projectType})
          .returns(ignores);
        commitConvention.default.resolves({devDependencies: commitConventionDevDependencies});

        const {vcsIgnore} = await scaffold(options);

        assert.equal(vcsIgnore, ignores);
      });
    });

    suite('verification', () => {
      test('that `npm test` is defined as the verification command', async () => {
        optionsValidator.validate
          .withArgs(options)
          .returns({projectRoot, projectName, visibility, vcs: {}, configs: {}, ciServices});
        prompts.prompt.resolves({});
        linting.default
          .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}});
        testing.default
          .withArgs({projectRoot, tests: {unit: undefined, integration: undefined}, visibility})
          .resolves({devDependencies: testingDevDependencies});
        commitConvention.default.resolves({devDependencies: commitConventionDevDependencies});

        const {verificationCommand} = await scaffold(options);

        assert.equal(verificationCommand, 'npm test');
      });
    });

    suite('project details', () => {
      test('that details are passed along', async () => {
        const homepage = any.url();
        optionsValidator.validate
          .withArgs(options)
          .returns({projectRoot, projectName, visibility, vcs: {}, configs: {}, ciServices});
        prompts.prompt.resolves({});
        linting.default
          .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}});
        packageBuilder.default.returns({homepage});
        testing.default
          .withArgs({projectRoot, tests: {unit: undefined, integration: undefined}, visibility})
          .resolves({devDependencies: testingDevDependencies});
        commitConvention.default.resolves({devDependencies: commitConventionDevDependencies});

        const {projectDetails} = await scaffold(options);

        assert.equal(projectDetails.homepage, homepage);
      });

      test('that details are not passed along if not defined', async () => {
        optionsValidator.validate
          .withArgs(options)
          .returns({projectRoot, projectName, visibility, vcs: {}, configs: {}, ciServices});
        prompts.prompt.resolves({});
        packageBuilder.default.resolves({});
        linting.default
          .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}});
        testing.default
          .withArgs({projectRoot, tests: {unit: undefined, integration: undefined}, visibility})
          .resolves({devDependencies: testingDevDependencies});
        commitConvention.default.resolves({devDependencies: commitConventionDevDependencies});

        const {projectDetails} = await scaffold(options);

        assert.isUndefined(projectDetails.homepage);
      });
    });

    suite('documentation', () => {
      test('that appropriate documentation is passed along', async () => {
        const docs = any.simpleObject();
        const scope = any.word();
        const projectType = any.word();
        const packageName = any.string();
        prompts.prompt.resolves({
          [questionNames.PROJECT_TYPE]: projectType,
          [questionNames.SCOPE]: scope
        });
        packageBuilder.default.returns({name: packageName});
        documentation.default.withArgs({projectType, packageName, visibility, scope}).returns(docs);
        optionsValidator.validate
          .returns({projectRoot, projectName, visibility, vcs: {}, configs: {}, ciServices, scope});
        linting.default
          .resolves({devDependencies: any.listOf(any.string), vcsIgnore: {files: any.listOf(any.string)}});
        testing.default
          .withArgs({projectRoot, tests: {unit: undefined, integration: undefined}, visibility})
          .resolves({devDependencies: testingDevDependencies});
        commitConvention.default.resolves({devDependencies: commitConventionDevDependencies});

        const {documentation: documentationContent} = await scaffold(options);

        assert.equal(documentationContent, docs);
      });
    });
  });
});
