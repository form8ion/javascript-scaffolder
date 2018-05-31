# javascript-scaffolder

opinionated scaffolder for JavaScript projects

<!-- status badges -->
[![Build Status][ci-badge]][ci-link]
[![Codecov](https://img.shields.io/codecov/c/github/travi/javascript-scaffolder.svg)](https://codecov.io/github/travi/javascript-scaffolder)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


* [Usage](#usage)
  * [Installation](#installation)
  * [As one of the languages for scaffolding a project](#as-one-of-the-languages-for-scaffolding-a-project)
    * [Example](#example)
    * [Options](#options)
      * [`projectRoot` __string__ (_required_)](#projectroot-__string__-_required_)
      * [`projectName` __string__ (_required_)](#projectname-__string__-_required_)
      * [`visibility` __string__ (_required_)](#visibility-__string__-_required_)
      * [`license` __string__ (_required_)](#license-__string__-_required_)
      * [`vcs` __object__ (_required_)](#vcs-__object__-_required_)
      * [`ci` __string__ (_optional_)](#ci-__string__-_optional_)
      * [`description` __string__ (_optional_)](#description-__string__-_optional_)
      * [`configs` __object__ (_optional_)](#configs-__object__-_optional_)
      * [`overrides` __object__ (_optional_)](#overrides-__object__-_optional_)
* [Contributing](#contributing)
  * [Dependencies](#dependencies)
  * [Verification](#verification)
* [Related Projects](#related-projects)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Features

* Sets the [node.js](https://nodejs.org/) version to the latest or LTS version
  (your choice) using [nvm](https://github.com/creationix/nvm)
* Scaffolds the `package.json`
  * Enables linting of:
    * JavaScript with [ESLint](https://eslint.org/)
    * The `.travis.yml` using [`travis.rb`](https://github.com/travis-ci/travis.rb#lint),
      when [Travis](https://travis-ci.com) is the chosen CI
  * enables updating the lockfile for [Greenkeeper](https://greenkeeper.io) PRs
* Enables transpilation with [Babel](https://babeljs.io)
* Defines and enforces the [commit message convention](https://conventionalcommits.org/)
* Defines [badges](https://sheilds.io) for inclusion in the `README.md`
* Defines files to be ignored from `git` and `npm`

## Usage

<!-- consumer badges -->
[![npm][npm-badge]][npm-link]
[![MIT license][license-badge]][license-link]

### Installation

```sh
$ npm install @travi/javascript-scaffolder -S
```

### As one of the languages for scaffolding a project

This scaffolder is intended to be used to scaffold the
[language specific details](https://github.com/travi/project-scaffolder#languages-_optional_)
within the [project-scaffolder](https://github.com/travi/project-scaffolder).

#### Example

```js
import program from 'commander';
import {scaffold} from '@travi/project-scaffolder';
import {scaffold as scaffoldJavaScript} from '@travi/javascript-scaffolder';

program
  .command('scaffold')
  .description('scaffold a new project')
  .action(() => scaffold({
    languages: {
      JavaScript: options => scaffoldJavaScript({
        ...options,
        configs: {
          eslint: {prefix: '@travi/travi', packageName: '@travi/eslint-config-travi'},
          commitlint: {name: 'travi', packageName: 'commitlint-config-travi'},
          babelPreset: {name: 'travi', packageName: 'babel-preset-travi'}
        }
      })
    }, 
    overrides: {copyrightHolder: 'Matt Travi'}
  }).catch(err => {
    console.error(err);
    process.exitCode = 1;
  }));
```

#### Options

##### `projectRoot` __string__ (_required_)

path to the root of the project

##### `projectName` __string__ (_required_)

name of the project (w/o a [scope](https://docs.npmjs.com/misc/scope))

##### `visibility` __string__ (_required_)

visibility of the project (`Public` or `Private`)

##### `license` __string__ (_required_)

##### `vcs` __object__ (_required_)

* `host` __string__ (_required_)
  VCS hosting service
* `owner` __string__ (_required_)
  account name on the host service for the repository
* `name` __string__ (_required_)
  repository name 

##### `ci` __string__ (_optional_)

name of the chosen CI service

##### `description` __string__ (_optional_)

short summary of the project

##### `configs` __object__ (_optional_)

* `eslint`: __object__ (_optional_)
  details about the [shareable config](https://eslint.org/docs/developer-guide/shareable-configs)
  to be used for the project
  * `packageName` __string__ (_required_)
    name of the `npm` package
  * `prefix` __string__ (_required_)
    name to be used when referring to the config within the `.eslintrc` files
  
  :warning: while i'm not confident that it is the recommended convention, it
  is assumed the defined config has a `rules/` directory exposed from the package
  with rulesets defined for
  * `es6.js`
  * `tests/base.js`
  * `tests/mocha.js`
* `commitlint` __object__ (_optional_)
  details about the [shareable config](https://marionebl.github.io/commitlint/#/concepts-shareable-config)
  to be used for the project
  * `packageName` __string__ (_required_)
    name of the `npm` package
  * `name` __string__ (_required_)
    name to be used when referring to the config within the `.commitlintrc.js` file
* `babelPreset` __object__ (_optional_)
  details about the [preset](https://babeljs.io/docs/plugins/#creating-a-preset)
  to be used for the project
  * `packageName` __string__ (_required_)
    name of the `npm` package
  * `name` __string__ (_required_)
    shorthand name to be used when referring to the config
    
##### `overrides` __object__ (_optional_)

* `npmAccount` __string__ (_optional_)
  the account the package should be published under. used to suggest a
  [scope](https://docs.npmjs.com/misc/scope). defaults to `$ npm whoami`
* `author` __object__ (_optional_)
  [details](https://docs.npmjs.com/files/package.json#people-fields-author-contributors)
  about the package author
  * `name` __string__ (_required_) defaults to `$npm config get init.author.name`
  * `email` __string__ (_optional_) defaults to `$npm config get init.author.email`
  * `url` __string (_optional_) defaults to `$npm config get init.author.url`
  
## Contributing

<!-- contribution badges -->
[![Conventional Commits][commit-convention-badge]][commit-convention-link]
[![Commitizen friendly][commitizen-badge]][commitizen-link]
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Greenkeeper badge](https://badges.greenkeeper.io/travi/javascript-scaffolder.svg)](https://greenkeeper.io/)
[![PRs Welcome][PRs-badge]][PRs-link]

### Dependencies

```sh
$ nvm install
$ npm install
```

### Verification

```sh
$ npm test
```

## Related Projects

* [project-scaffolder](https://npm.im/@travi/project-scaffolder)
* [scaffolder-sub-command](https://github.com/travi/scaffolder-sub-command)
* [cli](https://npm.im/@travi/cli)

[npm-link]: https://www.npmjs.com/package/@travi/javascript-scaffolder
[npm-badge]: https://img.shields.io/npm/v/@travi/javascript-scaffolder.svg
[license-link]: LICENSE
[license-badge]: https://img.shields.io/github/license/travi/javascript-scaffolder.svg
[ci-link]: https://travis-ci.org/travi/javascript-scaffolder
[ci-badge]: https://img.shields.io/travis/travi/javascript-scaffolder.svg?branch=master
[commit-convention-link]: https://conventionalcommits.org
[commit-convention-badge]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg
[commitizen-link]: http://commitizen.github.io/cz-cli/
[commitizen-badge]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[PRs-link]: http://makeapullrequest.com
[PRs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg
