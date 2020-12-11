# CI Services

The CI services map defines the supported CI services the user will be
presented with when running the scaffolder.

## Example

```javascript
{
  CIServiceName: {scaffolder: opts => scaffold(opts), public: true}
}
```

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

Consumer-provided plugin(??) called when this CI service is selected by the
user in the interactive prompt. Will be called with the following arguments:

* `projectRoot` __string__ full path to directory where scaffolder will create
  the JavaScript project
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

#### public: boolean (optional)

Value will be used to determine whether to display this as an option pending
the user's selection of `visibility` in prior prompts.

#### private: boolean (optional)

Value will be used to determine whether to display this as an option pending
the user's selection of `visibility` in prior prompts.
