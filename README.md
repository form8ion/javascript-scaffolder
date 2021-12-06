# javascript-scaffolder

opinionated scaffolder for JavaScript projects

<!--status-badges start -->

[![Codecov](https://img.shields.io/codecov/c/github/travi/javascript-scaffolder.svg)](https://codecov.io/github/travi/javascript-scaffolder)
[![Node CI Workflow Status][github-actions-ci-badge]][github-actions-ci-link]

<!--status-badges end -->

## Table of Contents

* [Features](#features)
* [Usage](#usage)
  * [Installation](#installation)
  * [As one of the languages for scaffolding a project](#as-one-of-the-languages-for-scaffolding-a-project)
    * [Example](#example)
      * [Dependencies:](#dependencies)
      * [Execute](#execute)
    * [Options](#options)
      * [`projectRoot` __string__ (_required_)](#projectroot-string-required)
      * [`projectName` __string__ (_required_)](#projectname-string-required)
      * [`visibility` __string__ (_required_)](#visibility-string-required)
      * [`license` __string__ (_required_)](#license-string-required)
      * [`vcs` __object__ (_required_)](#vcs-object-required)
      * [`description` __string__ (_optional_)](#description-string-optional)
      * [`configs` __object__ (_optional_)](#configs-object-optional)
      * [`overrides` __object__ (_optional_)](#overrides-object-optional)
      * [`registries` __object__ (_optional_)](#registries-object-optional)
      * [`ciServices` __object__ (_optional_)](#ciservices-object-optional)
      * [`applicationTypes` __object__ (_optional_)](#applicationtypes-object-optional)
      * [`unitTestFrameworks` __object__ (_required_)](#unittestframeworks-object-required)
* [Contributing](#contributing)
  * [Dependencies](#dependencies-1)
  * [Verification](#verification)
* [Related Projects](#related-projects)

## Features

* Sets the [node.js](https://nodejs.org/) version to the latest or LTS version
  (your choice) using [nvm](https://github.com/creationix/nvm)
* Scaffolds the `package.json`
  * Enables linting of:
    * JavaScript with [ESLint](https://eslint.org/)
    * Markdown with [remark-lint](https://github.com/remarkjs/remark-lint/tree/master/packages/remark-lint)
    * Peer-dependency compatibiltiy (by running `npm ls` and ensuring a `0`
      exit code)
    * Sensitive files to prevent commiting secrets using [ban-sensitive-files](https://github.com/bahmutov/ban-sensitive-files)
    * The `.travis.yml` using [travis-lint](https://github.com/pwmckenna/node-travis-lint),
      when [Travis](https://travis-ci.com) is the chosen CI
* Enables transpilation with [Babel](https://babeljs.io)
* Defines and enforces the [commit message convention](https://conventionalcommits.org/)
* Defines [badges](https://shields.io) for inclusion in the `README.md`
* Defines files to be ignored from `git` and `npm`
* Scaffolds CI service config from the user choice of the
  [provided scaffolders](#ciservices-object-optional)

## Usage

<!--consumer-badges start -->

[![npm][npm-badge]][npm-link]
![node][node-badge]
[![MIT license][license-badge]][license-link]

<!--consumer-badges end -->

### Installation

```sh
$ npm install @travi/javascript-scaffolder --save-prod
```

### As one of the languages for scaffolding a project

This scaffolder is intended to be used to scaffold the
[language specific details](https://github.com/form8ion/project#languages-optional)
within the [project-scaffolder](https://github.com/form8ion/project).

#### Example

##### Dependencies:

```javascript
import {scaffold as scaffoldJavaScript} from '@travi/javascript-scaffolder';
```

##### Execute

```javascript
(async () => {
  scaffoldJavaScript({
    configs: {
      eslint: {scope: '@form8ion'},
      remark: '@form8ion/remark-lint-preset',
      babelPreset: {name: '@form8ion', packageName: '@form8ion/babel-preset'},
      commitlint: {name: '@form8ion', packageName: '@form8ion/commitlint-config'}
    },
    overrides: {npmAccount: 'form8ion'},
    ciServices: {}
  });
})();
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
  is assumed the defined config has a `rules/` directory exposed from the
  package with rulesets defined for

  * `es6.js`
  * `tests/base.js`
  * `tests/mocha.js`

* `commitlint` __object__ (_optional_)
  details about the [shareable config](https://marionebl.github.io/commitlint/#/concepts-shareable-config)
  to be used for the project
  * `packageName` __string__ (_required_)
    name of the `npm` package
  * `name` __string__ (_required_)
    name to be used when referring to the config within the `.commitlintrc.js`
    file

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
  * `url` __string__ (_optional_) defaults to `$npm config get init.author.url`

##### `registries` __object__ (_optional_)

* keys: __string__ Scope of packages related to this registry (without the `@`)
* values: __string__ URL for the registry

##### `ciServices` __object__ (_optional_)

* keys: __string__ Name of the service
* values: __object__
  * `scaffolder`: __function__ (_required_) scaffolds the ci service options
  * `public`: __boolean__ (_optional_) whether this service should be presented
    as a public option
  * `private`: __boolean__ (_optional_) whether this service should be presented
    as a private option

##### `applicationTypes` __object__ (_optional_)

* keys: __string__ Name of the type of application
* values: __object__
  * `scaffolder` __function__ (_required_) scaffolds the application

##### `unitTestFrameworks` __object__ (_required_)

[frameworks](https://github.com/form8ion/awesome#unit-testing-frameworks) to be
passed to the [unit-testing scaffolder](https://github.com/form8ion/javascript-core#frameworks-object-required)

## Contributing

<!--contribution-badges start -->

[![Conventional Commits][commit-convention-badge]][commit-convention-link]
[![Commitizen friendly][commitizen-badge]][commitizen-link]
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![PRs Welcome][prs-badge]][prs-link]
[![Renovate][renovate-badge]][renovate-link]

<!--contribution-badges end -->

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

* [project-scaffolder](https://npm.im/@form8ion/project)
* [travis-scaffolder-javascript](https://github.com/travi/travis-scaffolder-javascript)
* [cli](https://npm.im/@travi/cli)

[npm-link]: https://www.npmjs.com/package/@travi/javascript-scaffolder

[npm-badge]: https://img.shields.io/npm/v/@travi/javascript-scaffolder.svg

[node-badge]: https://img.shields.io/node/v/@travi/javascript-scaffolder.svg

[license-link]: LICENSE

[license-badge]: https://img.shields.io/github/license/travi/javascript-scaffolder.svg

[commit-convention-link]: https://conventionalcommits.org

[commit-convention-badge]: https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg

[commitizen-link]: http://commitizen.github.io/cz-cli/

[commitizen-badge]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg

[prs-link]: http://makeapullrequest.com

[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg

[renovate-link]: https://renovatebot.com

[renovate-badge]: https://img.shields.io/badge/renovate-enabled-brightgreen.svg?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzNjkgMzY5Ij48Y2lyY2xlIGN4PSIxODkuOSIgY3k9IjE5MC4yIiByPSIxODQuNSIgZmlsbD0iI2ZmZTQyZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTUgLTYpIi8+PHBhdGggZmlsbD0iIzhiYjViNSIgZD0iTTI1MSAyNTZsLTM4LTM4YTE3IDE3IDAgMDEwLTI0bDU2LTU2YzItMiAyLTYgMC03bC0yMC0yMWE1IDUgMCAwMC03IDBsLTEzIDEyLTktOCAxMy0xM2ExNyAxNyAwIDAxMjQgMGwyMSAyMWM3IDcgNyAxNyAwIDI0bC01NiA1N2E1IDUgMCAwMDAgN2wzOCAzOHoiLz48cGF0aCBmaWxsPSIjZDk1NjEyIiBkPSJNMzAwIDI4OGwtOCA4Yy00IDQtMTEgNC0xNiAwbC00Ni00NmMtNS01LTUtMTIgMC0xNmw4LThjNC00IDExLTQgMTUgMGw0NyA0N2M0IDQgNCAxMSAwIDE1eiIvPjxwYXRoIGZpbGw9IiMyNGJmYmUiIGQ9Ik04MSAxODVsMTgtMTggMTggMTgtMTggMTh6Ii8+PHBhdGggZmlsbD0iIzI1YzRjMyIgZD0iTTIyMCAxMDBsMjMgMjNjNCA0IDQgMTEgMCAxNkwxNDIgMjQwYy00IDQtMTEgNC0xNSAwbC0yNC0yNGMtNC00LTQtMTEgMC0xNWwxMDEtMTAxYzUtNSAxMi01IDE2IDB6Ii8+PHBhdGggZmlsbD0iIzFkZGVkZCIgZD0iTTk5IDE2N2wxOC0xOCAxOCAxOC0xOCAxOHoiLz48cGF0aCBmaWxsPSIjMDBhZmIzIiBkPSJNMjMwIDExMGwxMyAxM2M0IDQgNCAxMSAwIDE2TDE0MiAyNDBjLTQgNC0xMSA0LTE1IDBsLTEzLTEzYzQgNCAxMSA0IDE1IDBsMTAxLTEwMWM1LTUgNS0xMSAwLTE2eiIvPjxwYXRoIGZpbGw9IiMyNGJmYmUiIGQ9Ik0xMTYgMTQ5bDE4LTE4IDE4IDE4LTE4IDE4eiIvPjxwYXRoIGZpbGw9IiMxZGRlZGQiIGQ9Ik0xMzQgMTMxbDE4LTE4IDE4IDE4LTE4IDE4eiIvPjxwYXRoIGZpbGw9IiMxYmNmY2UiIGQ9Ik0xNTIgMTEzbDE4LTE4IDE4IDE4LTE4IDE4eiIvPjxwYXRoIGZpbGw9IiMyNGJmYmUiIGQ9Ik0xNzAgOTVsMTgtMTggMTggMTgtMTggMTh6Ii8+PHBhdGggZmlsbD0iIzFiY2ZjZSIgZD0iTTYzIDE2N2wxOC0xOCAxOCAxOC0xOCAxOHpNOTggMTMxbDE4LTE4IDE4IDE4LTE4IDE4eiIvPjxwYXRoIGZpbGw9IiMzNGVkZWIiIGQ9Ik0xMzQgOTVsMTgtMTggMTggMTgtMTggMTh6Ii8+PHBhdGggZmlsbD0iIzFiY2ZjZSIgZD0iTTE1MyA3OGwxOC0xOCAxOCAxOC0xOCAxOHoiLz48cGF0aCBmaWxsPSIjMzRlZGViIiBkPSJNODAgMTEzbDE4LTE3IDE4IDE3LTE4IDE4ek0xMzUgNjBsMTgtMTggMTggMTgtMTggMTh6Ii8+PHBhdGggZmlsbD0iIzk4ZWRlYiIgZD0iTTI3IDEzMWwxOC0xOCAxOCAxOC0xOCAxOHoiLz48cGF0aCBmaWxsPSIjYjUzZTAyIiBkPSJNMjg1IDI1OGw3IDdjNCA0IDQgMTEgMCAxNWwtOCA4Yy00IDQtMTEgNC0xNiAwbC02LTdjNCA1IDExIDUgMTUgMGw4LTdjNC01IDQtMTIgMC0xNnoiLz48cGF0aCBmaWxsPSIjOThlZGViIiBkPSJNODEgNzhsMTgtMTggMTggMTgtMTggMTh6Ii8+PHBhdGggZmlsbD0iIzAwYTNhMiIgZD0iTTIzNSAxMTVsOCA4YzQgNCA0IDExIDAgMTZMMTQyIDI0MGMtNCA0LTExIDQtMTUgMGwtOS05YzUgNSAxMiA1IDE2IDBsMTAxLTEwMWM0LTQgNC0xMSAwLTE1eiIvPjxwYXRoIGZpbGw9IiMzOWQ5ZDgiIGQ9Ik0yMjggMTA4bC04LThjLTQtNS0xMS01LTE2IDBMMTAzIDIwMWMtNCA0LTQgMTEgMCAxNWw4IDhjLTQtNC00LTExIDAtMTVsMTAxLTEwMWM1LTQgMTItNCAxNiAweiIvPjxwYXRoIGZpbGw9IiNhMzM5MDQiIGQ9Ik0yOTEgMjY0bDggOGM0IDQgNCAxMSAwIDE2bC04IDdjLTQgNS0xMSA1LTE1IDBsLTktOGM1IDUgMTIgNSAxNiAwbDgtOGM0LTQgNC0xMSAwLTE1eiIvPjxwYXRoIGZpbGw9IiNlYjZlMmQiIGQ9Ik0yNjAgMjMzbC00LTRjLTYtNi0xNy02LTIzIDAtNyA3LTcgMTcgMCAyNGw0IDRjLTQtNS00LTExIDAtMTZsOC04YzQtNCAxMS00IDE1IDB6Ii8+PHBhdGggZmlsbD0iIzEzYWNiZCIgZD0iTTEzNCAyNDhjLTQgMC04LTItMTEtNWwtMjMtMjNhMTYgMTYgMCAwMTAtMjNMMjAxIDk2YTE2IDE2IDAgMDEyMiAwbDI0IDI0YzYgNiA2IDE2IDAgMjJMMTQ2IDI0M2MtMyAzLTcgNS0xMiA1em03OC0xNDdsLTQgMi0xMDEgMTAxYTYgNiAwIDAwMCA5bDIzIDIzYTYgNiAwIDAwOSAwbDEwMS0xMDFhNiA2IDAgMDAwLTlsLTI0LTIzLTQtMnoiLz48cGF0aCBmaWxsPSIjYmY0NDA0IiBkPSJNMjg0IDMwNGMtNCAwLTgtMS0xMS00bC00Ny00N2MtNi02LTYtMTYgMC0yMmw4LThjNi02IDE2LTYgMjIgMGw0NyA0NmM2IDcgNiAxNyAwIDIzbC04IDhjLTMgMy03IDQtMTEgNHptLTM5LTc2Yy0xIDAtMyAwLTQgMmwtOCA3Yy0yIDMtMiA3IDAgOWw0NyA0N2E2IDYgMCAwMDkgMGw3LThjMy0yIDMtNiAwLTlsLTQ2LTQ2Yy0yLTItMy0yLTUtMnoiLz48L3N2Zz4=

[github-actions-ci-link]: https://github.com/travi/javascript-scaffolder/actions?query=workflow%3A%22Node.js+CI%22+branch%3Amaster

[github-actions-ci-badge]: https://github.com/travi/javascript-scaffolder/workflows/Node.js%20CI/badge.svg
