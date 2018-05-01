import path from 'path';
import fs from 'mz/fs';
import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import * as prompts from '../../src/prompts';
import * as packageBuilder from '../../src/package';
import * as installer from '../../src/install';
import * as exec from '../../third-party-wrappers/exec-as-promised';
import {scaffold} from '../../src/scaffolder';

suite('javascript project scaffolder', () => {
  let sandbox;
  const projectRoot = any.string();
  const projectName = any.string();
  const visibility = any.fromList(['Private', 'Public']);
  const ltsVersion = `v${any.integer()}.${any.integer()}.${any.integer()}`;
  const latestVersion = `v${any.integer()}.${any.integer()}.${any.integer()}`;

  setup(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(fs, 'writeFile');
    sandbox.stub(fs, 'copyFile');
    sandbox.stub(packageBuilder, 'default');
    sandbox.stub(installer, 'default');
    sandbox.stub(exec, 'default');
    sandbox.stub(prompts, 'prompt');

    fs.writeFile.resolves();
    fs.copyFile.resolves();
    exec.default
      .withArgs('. ~/.nvm/nvm.sh && nvm ls-remote')
      .resolves([...any.listOf(any.word), latestVersion, ''].join('\n'));
    exec.default
      .withArgs('. ~/.nvm/nvm.sh && nvm ls-remote --lts')
      .resolves([...any.listOf(any.word), ltsVersion, ''].join('\n'));
    packageBuilder.default.returns({});
  });

  teardown(() => sandbox.restore());

  suite('config files', () => {
    test('that config files are created', () => {
      prompts.prompt.resolves({[prompts.questionNames.NODE_VERSION_CATEGORY]: any.word()});

      return scaffold({visibility, projectRoot, vcs: {}}).then(() => {
        assert.calledWith(
          fs.copyFile,
          path.resolve(__dirname, '../../', 'templates', 'huskyrc.json'),
          `${projectRoot}/.huskyrc.json`
        );
        assert.calledWith(
          fs.copyFile,
          path.resolve(__dirname, '../../', 'templates', 'commitlintrc.js'),
          `${projectRoot}/.commitlintrc.js`
        );
        assert.calledWith(
          fs.copyFile,
          path.resolve(__dirname, '../../', 'templates', 'nycrc.json'),
          `${projectRoot}/.nycrc`
        );
      });
    });

    suite('npm ignore', () => {
      test('that files and directories are defined to be ignored from the published npm package', async () => {
        prompts.prompt.resolves({
          [prompts.questionNames.NODE_VERSION_CATEGORY]: any.word(),
          [prompts.questionNames.PACKAGE_TYPE]: 'Package'
        });

        await scaffold({projectRoot, projectName, visibility: 'Public', vcs: {}});

        assert.calledWith(
          fs.writeFile,
          `${projectRoot}/.npmignore`,
          sinon.match(`/src/
/test/
/coverage/
/.nyc_output/

.babelrc
.commitlintrc.js
.editorconfig
.eslintcache
.eslintignore
.eslintrc.yml
.gitattributes
.huskyrc.json
.markdownlintrc
.nvmrc
coverage.lcov
rollup.config.js`)
        );
      });

      test('that the travis config is ignored when travis is the ci service', async () => {
        prompts.prompt.resolves({
          [prompts.questionNames.NODE_VERSION_CATEGORY]: any.word(),
          [prompts.questionNames.PACKAGE_TYPE]: 'Package'
        });
        packageBuilder.default.returns({});

        await scaffold({projectRoot, projectName, visibility: 'Public', ci: 'Travis', vcs: {}});

        assert.calledWith(
          fs.writeFile,
          `${projectRoot}/.npmignore`,
          sinon.match(`
.travis.yml
`)
        );
      });

      test('that the github settings file is ignored when github is the vcs host', async () => {
        prompts.prompt.resolves({
          [prompts.questionNames.NODE_VERSION_CATEGORY]: any.word(),
          [prompts.questionNames.PACKAGE_TYPE]: 'Package'
        });
        packageBuilder.default.returns({});

        await scaffold({projectRoot, projectName, visibility: 'Public', vcs: {host: 'GitHub'}});

        assert.calledWith(
          fs.writeFile,
          `${projectRoot}/.npmignore`,
          sinon.match(`
/.github/
`)
        );
      });

      test('that no npm ignore file is generated for non-packages', async () => {
        prompts.prompt.resolves({
          [prompts.questionNames.NODE_VERSION_CATEGORY]: any.word(),
          [prompts.questionNames.PACKAGE_TYPE]: any.word()
        });

        await scaffold({projectRoot, projectName, visibility: 'Public', vcs: {}});

        assert.neverCalledWith(fs.writeFile, `${projectRoot}/.npmignore`);
      });
    });

    suite('eslint-ignore', () => {
      test('that non-source files are excluded from linting', async () => {
        prompts.prompt.resolves({
          [prompts.questionNames.NODE_VERSION_CATEGORY]: any.word(),
          [prompts.questionNames.UNIT_TESTS]: false
        });

        await scaffold({projectRoot, vcs: {}});

        assert.calledWith(fs.writeFile, `${projectRoot}/.eslintignore`, sinon.match('/lib/'));
        assert.neverCalledWith(fs.writeFile, `${projectRoot}/.eslintignore`, sinon.match('/coverage/'));
      });

      test('that the coverage folder is excluded from linting when the project is unit tested', async () => {
        prompts.prompt.resolves({
          [prompts.questionNames.NODE_VERSION_CATEGORY]: any.word(),
          [prompts.questionNames.UNIT_TESTS]: true
        });

        await scaffold({projectRoot, vcs: {}});

        assert.calledWith(
          fs.writeFile,
          `${projectRoot}/.eslintignore`,
          sinon.match(`
/coverage/`)
        );
      });
    });

    suite('unit test', () => {
      test('that a canary test is included when the project will be unit tested', async () => {
        prompts.prompt.resolves({
          [prompts.questionNames.NODE_VERSION_CATEGORY]: any.word(),
          [prompts.questionNames.UNIT_TESTS]: true
        });

        await scaffold({projectRoot, vcs: {}});

        assert.calledWith(
          fs.copyFile,
          path.resolve(__dirname, '../../', 'templates', 'canary-test.txt'),
          `${projectRoot}/test/unit/canary-test.js`
        );
      });

      test('that a canary test is not included when the project will be not unit tested', async () => {
        prompts.prompt.resolves({
          [prompts.questionNames.NODE_VERSION_CATEGORY]: any.word(),
          [prompts.questionNames.UNIT_TESTS]: false
        });

        await scaffold({projectRoot, vcs: {}});

        assert.neverCalledWith(
          fs.copyFile,
          path.resolve(__dirname, '../../', 'templates', 'canary-test.txt'),
          `${projectRoot}/test/unit/canary-test.js`
        );
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
      const ci = any.word();
      const description = any.sentence();
      prompts.prompt.resolves({
        [prompts.questionNames.SCOPE]: scope,
        [prompts.questionNames.PACKAGE_TYPE]: packageType,
        [prompts.questionNames.UNIT_TESTS]: tests.unit,
        [prompts.questionNames.INTEGRATION_TESTS]: tests.integration,
        [prompts.questionNames.NODE_VERSION_CATEGORY]: any.word(),
        [prompts.questionNames.AUTHOR_NAME]: authorName,
        [prompts.questionNames.AUTHOR_EMAIL]: authorEmail,
        [prompts.questionNames.AUTHOR_URL]: authorUrl
      });
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
          ci,
          description
        })
        .returns(packageDetails);

      return scaffold({projectRoot, projectName, visibility, license, vcs, ci, description})
        .then(() => assert.calledWith(
          fs.writeFile,
          `${projectRoot}/package.json`,
          JSON.stringify(packageDetails)
        ));
    });

    suite('dependencies', () => {
      const defaultDependencies = [
        '@travi/eslint-config-travi',
        'commitlint-config-travi',
        'npm-run-all',
        'husky@next',
        'cz-conventional-changelog',
        'greenkeeper-lockfile',
        'nyc'
      ];

      suite('scripts', () => {
        test('that scripting tools are installed', async () => {
          prompts.prompt.resolves({[prompts.questionNames.NODE_VERSION_CATEGORY]: any.word()});

          await scaffold({vcs: {}});

          assert.calledWith(installer.default, [...defaultDependencies]);
        });
      });

      suite('testing', () => {
        test('that mocha, chai, and sinon are installed when the project will be unit tested', async () => {
          prompts.prompt.resolves({
            [prompts.questionNames.NODE_VERSION_CATEGORY]: any.word(),
            [prompts.questionNames.UNIT_TESTS]: true
          });

          await scaffold({vcs: {}});

          assert.calledWith(installer.default, [...defaultDependencies, 'mocha', 'chai', 'sinon']);
        });

        test('that mocha, chai, and sinon are not installed when the project will not be unit tested', async () => {
          prompts.prompt.resolves({
            [prompts.questionNames.NODE_VERSION_CATEGORY]: any.word(),
            [prompts.questionNames.UNIT_TESTS]: false
          });

          await scaffold({vcs: {}});

          assert.calledWith(installer.default, [...defaultDependencies]);
        });

        test('that cucumber and chai are installed when the project will be integration tested', async () => {
          prompts.prompt.resolves({
            [prompts.questionNames.NODE_VERSION_CATEGORY]: any.word(),
            [prompts.questionNames.INTEGRATION_TESTS]: true
          });

          await scaffold({vcs: {}});

          assert.calledWith(installer.default, [...defaultDependencies, 'cucumber', 'chai']);
        });

        test('that cucumber and chai are not installed when the project will not be integration tested', async () => {
          prompts.prompt.resolves({
            [prompts.questionNames.NODE_VERSION_CATEGORY]: any.word(),
            [prompts.questionNames.INTEGRATION_TESTS]: false
          });

          await scaffold({vcs: {}});

          assert.calledWith(installer.default, [...defaultDependencies]);
        });

        test('that unique dependencies are requested when various reasons overlap', async () => {
          prompts.prompt.resolves({
            [prompts.questionNames.NODE_VERSION_CATEGORY]: any.word(),
            [prompts.questionNames.UNIT_TESTS]: true,
            [prompts.questionNames.INTEGRATION_TESTS]: true
          });

          await scaffold({vcs: {}});

          assert.calledWith(installer.default, [...defaultDependencies, 'mocha', 'chai', 'sinon', 'cucumber']);
        });

        test('that codecov is installed for public projects', async () => {
          prompts.prompt.resolves({[prompts.questionNames.NODE_VERSION_CATEGORY]: any.word()});

          await scaffold({visibility: 'Public', vcs: {}});

          assert.calledWith(installer.default, [...defaultDependencies, 'codecov']);
        });

        test('that codecov is not installed for private projects', async () => {
          prompts.prompt.resolves({[prompts.questionNames.NODE_VERSION_CATEGORY]: any.word()});

          await scaffold({visibility: 'Private', vcs: {}});

          assert.calledWith(installer.default, defaultDependencies);
        });
      });
    });
  });

  suite('save-exact', () => {
    test('that the project is configured to use exact dependency versions if it is an application', () => {
      prompts.prompt.resolves({
        [prompts.questionNames.NODE_VERSION_CATEGORY]: any.word(),
        [prompts.questionNames.PACKAGE_TYPE]: 'Application'
      });

      return scaffold({projectRoot, projectName, visibility: 'Public', vcs: {}}).then(() => {
        assert.calledWith(fs.writeFile, `${projectRoot}/.npmrc`, 'save-exact=true');
      });
    });

    test('that the project is allowed to use semver ranges if it is a package', () => {
      packageBuilder.default.returns({name: any.word()});
      prompts.prompt.resolves({
        [prompts.questionNames.NODE_VERSION_CATEGORY]: any.word(),
        [prompts.questionNames.PACKAGE_TYPE]: 'Package'
      });

      return scaffold({projectRoot, projectName, visibility: 'Public', vcs: {}}).then(() => {
        assert.neverCalledWith(fs.writeFile, `${projectRoot}/.npmrc`);
      });
    });
  });

  suite('nvm', () => {
    test('that the latest available version is used for the project when `Latest` is chosen', () => {
      prompts.prompt.resolves({
        [prompts.questionNames.NODE_VERSION_CATEGORY]: 'Latest'
      });

      return scaffold({projectRoot, projectName, visibility: 'Public', vcs: {}}).then(() => {
        assert.calledWith(fs.writeFile, `${projectRoot}/.nvmrc`, latestVersion);
        assert.calledWith(exec.default, '. ~/.nvm/nvm.sh && nvm install', {silent: false});
      });
    });

    test('that the latest available version is used for the project when `LTS` is chosen', () => {
      prompts.prompt.resolves({
        [prompts.questionNames.NODE_VERSION_CATEGORY]: 'LTS'
      });

      return scaffold({projectRoot, projectName, visibility: 'Public', vcs: {}}).then(() => {
        assert.calledWith(fs.writeFile, `${projectRoot}/.nvmrc`, ltsVersion);
        assert.calledWith(exec.default, '. ~/.nvm/nvm.sh && nvm install', {silent: false});
      });
    });
  });

  suite('data passed downstream', () => {
    suite('badges', () => {
      test('that the npm badge is defined for public packages', async () => {
        const packageName = any.word();
        packageBuilder.default.returns({name: packageName});
        prompts.prompt.resolves({
          [prompts.questionNames.NODE_VERSION_CATEGORY]: any.word(),
          [prompts.questionNames.PACKAGE_TYPE]: 'Package'
        });

        const {badges} = await scaffold({projectRoot, projectName, visibility: 'Public', vcs: {}});

        assert.deepEqual(badges.consumer.npm, {
          img: `https://img.shields.io/npm/v/${packageName}.svg`,
          text: 'npm',
          link: `https://www.npmjs.com/package/${packageName}`
        });
      });

      test('that the npm badge is not defined for private packages', async () => {
        prompts.prompt.resolves({
          [prompts.questionNames.NODE_VERSION_CATEGORY]: any.word(),
          [prompts.questionNames.PACKAGE_TYPE]: 'Package'
        });

        const {badges} = await scaffold({projectRoot, projectName, visibility: 'Private', vcs: {}});

        assert.isUndefined(badges.consumer.npm);
      });

      test('that the npm badge is not defined if the project is not a package', async () => {
        prompts.prompt.resolves({
          [prompts.questionNames.NODE_VERSION_CATEGORY]: any.word(),
          [prompts.questionNames.PACKAGE_TYPE]: any.word()
        });

        const {badges} = await scaffold({projectRoot, projectName, visibility: 'Public', vcs: {}});

        assert.isUndefined(badges.consumer.npm);
      });

      test('that the commit-convention badges are provided', async () => {
        const packageName = any.word();
        packageBuilder.default.returns({name: packageName});
        prompts.prompt.resolves({[prompts.questionNames.NODE_VERSION_CATEGORY]: any.word()});

        const {badges} = await scaffold({projectRoot, projectName, vcs: {}});

        assert.deepEqual(badges.contribution['commit-convention'], {
          img: 'https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg',
          text: 'Conventional Commits',
          link: 'https://conventionalcommits.org'
        });
        assert.deepEqual(badges.contribution.commitizen, {
          img: 'https://img.shields.io/badge/commitizen-friendly-brightgreen.svg',
          text: 'Commitizen friendly',
          link: 'http://commitizen.github.io/cz-cli/'
        });
      });
    });

    suite('vcs ignore', () => {
      test('that files and directories are defined to be ignored from version control', async () => {
        prompts.prompt.resolves({[prompts.questionNames.NODE_VERSION_CATEGORY]: any.word()});

        const {vcsIgnore} = await scaffold({projectRoot, projectName, visibility: 'Public', vcs: {}});

        assert.include(vcsIgnore.files, '.eslintcache');

        assert.include(vcsIgnore.directories, '/node_modules/');
        assert.include(vcsIgnore.directories, '/lib/');
        assert.include(vcsIgnore.directories, '/coverage/');
        assert.include(vcsIgnore.directories, '/.nyc_output/');
      });
    });

    suite('verification', () => {
      test('that `npm test` is defined as the verification command', async () => {
        prompts.prompt.resolves({[prompts.questionNames.NODE_VERSION_CATEGORY]: any.word()});

        const {verificationCommand} = await scaffold({projectRoot, projectName, visibility: any.word(), vcs: {}});

        assert.equal(verificationCommand, 'npm test');
      });
    });

    suite('project details', () => {
      test('that details are passed along', async () => {
        const homepage = any.url();
        prompts.prompt.resolves({[prompts.questionNames.NODE_VERSION_CATEGORY]: any.word()});
        packageBuilder.default.returns({homepage});

        const {projectDetails} = await scaffold({projectRoot, projectName, visibility: any.word(), vcs: {}});

        assert.equal(projectDetails.homepage, homepage);
      });

      test('that details are not passed along if not defined', async () => {
        prompts.prompt.resolves({[prompts.questionNames.NODE_VERSION_CATEGORY]: any.word()});
        packageBuilder.default.returns({});

        const {projectDetails} = await scaffold({projectRoot, projectName, visibility: any.word(), vcs: {}});

        assert.isUndefined(projectDetails.homepage);
      });
    });
  });
});
