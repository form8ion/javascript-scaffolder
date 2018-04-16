import inquirer from 'inquirer';
import path from 'path';
import fs from 'mz/fs';
import {assert} from 'chai';
import any from '@travi/any';
import sinon from 'sinon';
import {
  scopePromptShouldBePresented,
  shouldBeScopedPromptShouldBePresented
} from '../../src/prompt-condiftionals';
import * as packageBuilder from '../../src/package';
import * as installer from '../../src/install';
import * as exec from '../../third-party-wrappers/exec-as-promised';
import scaffoldJavaScript, {questionNames} from '../../src/scaffolder';
import * as npmConf from '../../third-party-wrappers/npm-conf';

suite('javascript project scaffolder', () => {
  let sandbox;
  const projectRoot = any.string();
  const projectName = any.string();
  const visibility = any.fromList(['Private', 'Public']);
  const nodeVersionCategoryChoices = ['LTS', 'Latest'];
  const ltsVersion = `v${any.integer()}.${any.integer()}.${any.integer()}`;
  const latestVersion = `v${any.integer()}.${any.integer()}.${any.integer()}`;

  setup(() => {
    sandbox = sinon.sandbox.create();

    sandbox.stub(fs, 'writeFile');
    sandbox.stub(fs, 'copyFile');
    sandbox.stub(inquirer, 'prompt');
    sandbox.stub(packageBuilder, 'default');
    sandbox.stub(installer, 'default');
    sandbox.stub(exec, 'default');
    sandbox.stub(npmConf, 'default');

    fs.writeFile.resolves();
    fs.copyFile.resolves();
    exec.default
      .withArgs('. ~/.nvm/nvm.sh && nvm ls-remote')
      .resolves([...any.listOf(any.word), latestVersion, ''].join('\n'));
    exec.default
      .withArgs('. ~/.nvm/nvm.sh && nvm ls-remote --lts')
      .resolves([...any.listOf(any.word), ltsVersion, ''].join('\n'));
    npmConf.default.returns({get: () => undefined});
  });

  teardown(() => sandbox.restore());

  test('that the user is prompted for the necessary details', () => {
    const authorName = any.string();
    const authorEmail = any.string();
    const authorUrl = any.url();
    const get = sinon.stub();
    npmConf.default.returns({get});
    get.withArgs('init.author.name').returns(authorName);
    get.withArgs('init.author.email').returns(authorEmail);
    get.withArgs('init.author.url').returns(authorUrl);
    inquirer.prompt.resolves({[questionNames.NODE_VERSION_CATEGORY]: any.fromList(nodeVersionCategoryChoices)});

    return scaffoldJavaScript({visibility, projectRoot}).then(() => {
      assert.calledWith(
        inquirer.prompt,
        [
          {
            name: questionNames.NODE_VERSION_CATEGORY,
            message: 'What node.js version should be used?',
            type: 'list',
            choices: nodeVersionCategoryChoices,
            default: 'Latest'
          },
          {
            name: questionNames.PACKAGE_TYPE,
            message: 'What type of JavaScript project is this?',
            type: 'list',
            choices: ['Application', 'Package'],
            default: 'Package'
          },
          {
            name: questionNames.SHOULD_BE_SCOPED,
            message: 'Should this package be scoped?',
            type: 'confirm',
            when: shouldBeScopedPromptShouldBePresented,
            default: true
          },
          {
            name: questionNames.SCOPE,
            message: 'What is the scope?',
            when: scopePromptShouldBePresented,
            default: 'travi'
          },
          {
            name: questionNames.AUTHOR_NAME,
            message: 'What is the author\'s name?',
            default: authorName
          },
          {
            name: questionNames.AUTHOR_EMAIL,
            message: 'What is the author\'s email?',
            default: authorEmail
          },
          {
            name: questionNames.AUTHOR_URL,
            message: 'What is the author\'s website url?',
            default: authorUrl
          },
          {
            name: questionNames.UNIT_TESTS,
            message: 'Will this project be unit tested?',
            type: 'confirm',
            default: true
          },
          {
            name: questionNames.INTEGRATION_TESTS,
            message: 'Will this project be integration tested?',
            type: 'confirm',
            default: true
          }
        ]
      );
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
      inquirer.prompt.resolves({
        [questionNames.SCOPE]: scope,
        [questionNames.PACKAGE_TYPE]: packageType,
        [questionNames.UNIT_TESTS]: tests.unit,
        [questionNames.INTEGRATION_TESTS]: tests.integration,
        [questionNames.NODE_VERSION_CATEGORY]: any.fromList(nodeVersionCategoryChoices),
        [questionNames.AUTHOR_NAME]: authorName,
        [questionNames.AUTHOR_EMAIL]: authorEmail,
        [questionNames.AUTHOR_URL]: authorUrl
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
          ci
        })
        .returns(packageDetails);

      return scaffoldJavaScript({projectRoot, projectName, visibility, license, vcs, ci}).then(() => assert.calledWith(
        fs.writeFile,
        `${projectRoot}/package.json`,
        JSON.stringify(packageDetails)
      ));
    });

    suite('dependencies', () => {
      const defaultDependencies = [
        '@travi/eslint-config-travi',
        'npm-run-all',
        'husky@next',
        'cz-conventional-changelog',
        'greenkeeper-lockfile'
      ];

      suite('scripts', () => {
        test('that scripting tools are installed', async () => {
          inquirer.prompt.resolves({[questionNames.NODE_VERSION_CATEGORY]: any.word()});

          await scaffoldJavaScript({});

          assert.calledWith(installer.default, [...defaultDependencies]);
        });
      });

      suite('testing', () => {
        test('that mocha, chai, and sinon are installed when the project will be unit tested', async () => {
          inquirer.prompt.resolves({
            [questionNames.NODE_VERSION_CATEGORY]: any.fromList(nodeVersionCategoryChoices),
            [questionNames.UNIT_TESTS]: true
          });

          await scaffoldJavaScript({});

          assert.calledWith(installer.default, [...defaultDependencies, 'mocha', 'chai', 'sinon']);
        });

        test('that mocha, chai, and sinon are not installed when the project will not be unit tested', async () => {
          inquirer.prompt.resolves({
            [questionNames.NODE_VERSION_CATEGORY]: any.fromList(nodeVersionCategoryChoices),
            [questionNames.UNIT_TESTS]: false
          });

          await scaffoldJavaScript({});

          assert.calledWith(installer.default, [...defaultDependencies]);
        });

        test('that cucumber and chai are installed when the project will be integration tested', async () => {
          inquirer.prompt.resolves({
            [questionNames.NODE_VERSION_CATEGORY]: any.fromList(nodeVersionCategoryChoices),
            [questionNames.INTEGRATION_TESTS]: true
          });

          await scaffoldJavaScript({});

          assert.calledWith(installer.default, [...defaultDependencies, 'cucumber', 'chai']);
        });

        test('that cucumber and chai are not installed when the project will not be integration tested', async () => {
          inquirer.prompt.resolves({
            [questionNames.NODE_VERSION_CATEGORY]: any.fromList(nodeVersionCategoryChoices),
            [questionNames.INTEGRATION_TESTS]: false
          });

          await scaffoldJavaScript({});

          assert.calledWith(installer.default, [...defaultDependencies]);
        });

        test('that unique dependencies are requested when various reasons overlap', async () => {
          inquirer.prompt.resolves({
            [questionNames.NODE_VERSION_CATEGORY]: any.fromList(nodeVersionCategoryChoices),
            [questionNames.UNIT_TESTS]: true,
            [questionNames.INTEGRATION_TESTS]: true
          });

          await scaffoldJavaScript({});

          assert.calledWith(installer.default, [...defaultDependencies, 'mocha', 'chai', 'sinon', 'cucumber']);
        });
      });
    });
  });

  suite('save-exact', () => {
    test('that the project is configured to use exact dependency versions if it is an application', () => {
      inquirer.prompt.resolves({
        [questionNames.NODE_VERSION_CATEGORY]: any.fromList(nodeVersionCategoryChoices),
        [questionNames.PACKAGE_TYPE]: 'Application'
      });

      return scaffoldJavaScript({projectRoot, projectName, visibility: 'Public'}).then(() => {
        assert.calledWith(fs.writeFile, `${projectRoot}/.npmrc`, 'save-exact=true');
      });
    });

    test('that the project is allowed to use semver ranges if it is a package', () => {
      packageBuilder.default.returns({name: any.word()});
      inquirer.prompt.resolves({
        [questionNames.NODE_VERSION_CATEGORY]: any.fromList(nodeVersionCategoryChoices),
        [questionNames.PACKAGE_TYPE]: 'Package'
      });

      return scaffoldJavaScript({projectRoot, projectName, visibility: 'Public'}).then(() => {
        assert.neverCalledWith(fs.writeFile, `${projectRoot}/.npmrc`);
      });
    });
  });

  suite('nvm', () => {
    test('that the latest available version is used for the project when `Latest` is chosen', () => {
      inquirer.prompt.resolves({
        [questionNames.NODE_VERSION_CATEGORY]: 'Latest'
      });

      return scaffoldJavaScript({projectRoot, projectName, visibility: 'Public'}).then(() => {
        assert.calledWith(fs.writeFile, `${projectRoot}/.nvmrc`, latestVersion);
        assert.calledWith(exec.default, '. ~/.nvm/nvm.sh && nvm install', {silent: false});
      });
    });

    test('that the latest available version is used for the project when `LTS` is chosen', () => {
      inquirer.prompt.resolves({
        [questionNames.NODE_VERSION_CATEGORY]: 'LTS'
      });

      return scaffoldJavaScript({projectRoot, projectName, visibility: 'Public'}).then(() => {
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
        inquirer.prompt.resolves({
          [questionNames.NODE_VERSION_CATEGORY]: any.word(),
          [questionNames.PACKAGE_TYPE]: 'Package'
        });

        const {badges} = await scaffoldJavaScript({projectRoot, projectName, visibility: 'Public'});

        assert.deepEqual(badges.consumer.npm, {
          img: `https://img.shields.io/npm/v/${packageName}.svg`,
          text: 'npm',
          link: `https://www.npmjs.com/package/${packageName}`
        });
      });

      test('that the npm badge is not defined for private packages', async () => {
        inquirer.prompt.resolves({
          [questionNames.NODE_VERSION_CATEGORY]: any.word(),
          [questionNames.PACKAGE_TYPE]: 'Package'
        });

        const {badges} = await scaffoldJavaScript({projectRoot, projectName, visibility: 'Private'});

        assert.isUndefined(badges.consumer.npm);
      });

      test('that the npm badge is not defined if the project is not a package', async () => {
        inquirer.prompt.resolves({
          [questionNames.NODE_VERSION_CATEGORY]: any.word(),
          [questionNames.PACKAGE_TYPE]: any.word()
        });

        const {badges} = await scaffoldJavaScript({projectRoot, projectName, visibility: 'Public'});

        assert.isUndefined(badges.consumer.npm);
      });

      test('that the commit-convention badges are provided', async () => {
        const packageName = any.word();
        packageBuilder.default.returns({name: packageName});
        inquirer.prompt.resolves({[questionNames.NODE_VERSION_CATEGORY]: any.word()});

        const {badges} = await scaffoldJavaScript({projectRoot, projectName});

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
        inquirer.prompt.resolves({[questionNames.NODE_VERSION_CATEGORY]: any.word()});

        const {vcsIgnore} = await scaffoldJavaScript({projectRoot, projectName, visibility: 'Public'});

        assert.include(vcsIgnore.files, '.eslintcache');

        assert.include(vcsIgnore.directories, '/node_modules/');
        assert.include(vcsIgnore.directories, '/lib/');
      });
    });

    suite('npm ignore', () => {
      test('that files and directories are defined to be ignored from the published npm package', async () => {
        inquirer.prompt.resolves({
          [questionNames.NODE_VERSION_CATEGORY]: any.word(),
          [questionNames.PACKAGE_TYPE]: 'Package'
        });
        packageBuilder.default.returns({});

        await scaffoldJavaScript({projectRoot, projectName, visibility: 'Public'});

        assert.calledWith(
          fs.writeFile,
          `${projectRoot}/.npmignore`,
          sinon.match(`/src/
/test/

.editorconfig
.eslintcache
.eslintignore
.eslintrc.yml
.markdownlintrc
.nvmrc
rollup.config.js`)
        );
      });

      test('that the travis config is ignored when travis it the ci service', async () => {
        inquirer.prompt.resolves({
          [questionNames.NODE_VERSION_CATEGORY]: any.word(),
          [questionNames.PACKAGE_TYPE]: 'Package'
        });
        packageBuilder.default.returns({});

        await scaffoldJavaScript({projectRoot, projectName, visibility: 'Public', ci: 'Travis'});

        assert.calledWith(
          fs.writeFile,
          `${projectRoot}/.npmignore`,
          sinon.match(`
.travis.yml
`)
        );
      });

      test('that no npm ignore file is generated for non-packages', async () => {
        inquirer.prompt.resolves({
          [questionNames.NODE_VERSION_CATEGORY]: any.word(),
          [questionNames.PACKAGE_TYPE]: any.word()
        });

        await scaffoldJavaScript({projectRoot, projectName, visibility: 'Public'});

        assert.neverCalledWith(fs.writeFile, `${projectRoot}/.npmignore`);
      });
    });

    suite('verification', () => {
      test('that `npm test` is defined as the verification command', async () => {
        inquirer.prompt.resolves({[questionNames.NODE_VERSION_CATEGORY]: any.word()});

        const {verificationCommand} = await scaffoldJavaScript({projectRoot, projectName, visibility: any.word()});

        assert.equal(verificationCommand, 'npm test');
      });
    });
  });
});
