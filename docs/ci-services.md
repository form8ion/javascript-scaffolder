# CI Services

The CI services map defines the supported CI services the user will be
presented with when running the scaffolder.

## Example

```javascript
{
  CIServiceName: {scaffolder: opts => scaffold(opts), public: true}
}
```

## Existing scaffolders
There are already multiple CI service scaffolders [available for
consumption](https://github.com/form8ion/awesome#continuous-integration-services).
Should your workflow fit into those, feel free to integrate them directly. If
not, you are welcome and encouraged to build more (and maybe consider
submitting a PR with a link 😎)!

## Config

### keys: __string__

Keys in the CI services map define the choices the user will be presented with
when choosing their desired CI service. These have no functional impact on the
scaffolder.

example: `CIServiceName`

### values: __object__

Values in the CI services map define the actual mechanisms and configuration
that will be used by the JavaScript Scaffolder to scaffold the CI service for
the user's project.

#### scaffolder: __function__ (_required_)

Consumer-provided plugin called when this CI service is selected by the
user in the interactive prompt. Will be called with the following arguments:

* `projectRoot` __string__ full path to the directory where scaffolder will
  create the JavaScript project
* `vcs` __object__
  * `host` __string__ VCS hosting service to generate the repo with (e.g., `github`)
  * `owner` __string__ account name on the host service for the repository to
    generate (e.g., `form8ion`)
  * `name` __string__ repository name to generate (e.g., `javascript-scaffolder`)
* `visibility` __string__ visibility of the project to be scaffolded (valid
  values are: `Public`, `Private`)
* `projectType` __string__ type of project to be scaffolded (valid values are:
  `Application`, `Package`, `CLI`)
* `nodeVersionCategory` __string__ node category chosen for the project (valid
  values are: `Latest`, `LTS`)
* `tests` __object__
  * `unit` __boolean__ whether the project will be unit-tested
  * `integration` __boolean__ whether the project will be integration-tested

*Response*

The response object is commonly used across the project as a way for scaffolders
to communicate information to the parent.

* `nextSteps` __array__ list of strings that will be aggregated and displayed
  to the user when all scaffolding is complete. This can be used to remind the
  user about steps that the scaffolder is not able to complete or has not been
  developed, but may be needed before considering scaffolding complete.  (e.g.,
  `['decide whether default dependency automation settings are appropriate']`)
* `devDependencies` __array__ list of strings containing dev dependencies to
  be added to the project's `package.json` upon creation (e.g.
  `@travi/travis-lint`)
* `scripts` __object__ a map of scripts to add to the project's
  `package.json`
  * `keys` __string__ the name of the script you would like added to the
    `package.json` (e.g., `'disabled:lint:travis'`)
  * `values` __string__ the script to run when called (e.g., `'travis-lint
    .travis.yml'`)
* `badges` __object__
  * `status` __object__ badges to be added to the `status` section of the
    generated top-level README
    * `keys` __string__ name used to identify this badge type (e.g.,
      `github-actions-ci`)
    * `values` __object__
      * `text` __string__ (_required_) text you would like displayed on this
        badge (e.g., `Build Status`)
      * `img` __string__ (_required_) a url to the image for this badge. Each
        CI service has it's own way of handling badging. See [adding a github
        workflow status
        badge](https://docs.github.com/en/free-pro-team@latest/actions/managing-workflow-runs/adding-a-workflow-status-badge)
        for an example.
      * `link` __string__ (_required_) a url to the build status you would like
        to navigate the user to when the badge is clicked.

#### public: boolean (optional)

Value will be used to determine whether to display this as an option pending
the user's selection of `visibility` in prior prompts.

#### private: boolean (optional)

Value will be used to determine whether to display this as an option pending
the user's selection of `visibility` in prior prompts.
