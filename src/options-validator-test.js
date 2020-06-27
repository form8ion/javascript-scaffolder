import any from '@travi/any';
import {assert} from 'chai';
import {validate} from './options-validator';

suite('options validator', () => {
  test('that the options are required', () => assert.throws(() => validate(), '"value" is required'));

  test('that the `projectRoot` is required', () => {
    assert.throws(() => validate({}), '"projectRoot" is required');
  });

  test('that the `projectName` is required', () => assert.throws(
    () => validate({projectRoot: any.string()}),
    '"projectName" is required'
  ));

  test('that the `projectName` should not include a scope', () => {
    const projectName = `@${any.word()}/${any.word()}`;

    assert.throws(
      () => validate({projectRoot: any.string(), projectName}),
      `"projectName" with value "${projectName}" matches the inverted pattern: /^@\\w*\\//`
    );
  });

  suite('visibility', () => {
    test('that the `visibility` is required', () => assert.throws(
      () => validate({projectRoot: any.string(), projectName: any.string()}),
      '"visibility" is required'
    ));

    test('that `Public` is an allowed `visibility`', () => validate({
      projectRoot: any.string(),
      projectName: any.string(),
      visibility: 'Public',
      license: any.string(),
      vcs: {host: any.word(), owner: any.word(), name: any.word()},
      description: any.string(),
      unitTestFrameworks: {}
    }));

    test('that `Private` is an allowed `visibility`', () => validate({
      projectRoot: any.string(),
      projectName: any.string(),
      visibility: 'Private',
      license: any.string(),
      vcs: {host: any.word(), owner: any.word(), name: any.word()},
      description: any.string(),
      unitTestFrameworks: {}
    }));

    test('that `visibility` values other than `Public` or `Private` are invalid', () => assert.throws(
      () => validate({projectRoot: any.string(), projectName: any.string(), visibility: any.word()}),
      '"visibility" must be one of [Public, Private]'
    ));
  });

  test('that `license` is required', () => assert.throws(
    () => validate({
      projectRoot: any.string(),
      projectName: any.string(),
      visibility: any.fromList(['Public', 'Private'])
    }),
    '"license" is required'
  ));

  suite('vcs', () => {
    test('that `vcs.host` is required', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        vcs: {}
      }),
      '"vcs.host" is required'
    ));

    test('that `vcs.owner` is required', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        vcs: {host: any.word()}
      }),
      '"vcs.owner" is required'
    ));

    test('that `vcs.name` is required', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        vcs: {host: any.word(), owner: any.word()}
      }),
      '"vcs.name" is required'
    ));
  });

  suite('configs', () => {
    suite('eslint', () => {
      test('that `scope` is required', () => assert.throws(
        () => validate({
          projectRoot: any.string(),
          projectName: any.string(),
          visibility: any.fromList(['Public', 'Private']),
          license: any.string(),
          vcs: {host: any.word(), owner: any.word(), name: any.word()},
          ci: any.string(),
          description: any.string(),
          configs: {eslint: {}}
        }),
        '"configs.eslint.scope" is required'
      ));

      test('that `scope` must be a string', () => assert.throws(
        () => validate({
          projectRoot: any.string(),
          projectName: any.string(),
          visibility: any.fromList(['Public', 'Private']),
          license: any.string(),
          vcs: {host: any.word(), owner: any.word(), name: any.word()},
          ci: any.string(),
          description: any.string(),
          configs: {eslint: {scope: any.simpleObject()}}
        }),
        '"configs.eslint.scope" must be a string'
      ));

      test('that `scope` starts with `@`', () => {
        const scope = any.word();

        assert.throws(
          () => validate({
            projectRoot: any.string(),
            projectName: any.string(),
            visibility: any.fromList(['Public', 'Private']),
            license: any.string(),
            vcs: {host: any.word(), owner: any.word(), name: any.word()},
            ci: any.string(),
            description: any.string(),
            configs: {eslint: {scope}}
          }),
          `"configs.eslint.scope" with value "${scope}" fails to match the scope pattern`
        );
      });

      test('that `scope` does not contain a `/`', () => {
        const scope = `@${any.word()}/${any.word()}`;

        assert.throws(
          () => validate({
            projectRoot: any.string(),
            projectName: any.string(),
            visibility: any.fromList(['Public', 'Private']),
            license: any.string(),
            vcs: {host: any.word(), owner: any.word(), name: any.word()},
            ci: any.string(),
            description: any.string(),
            configs: {eslint: {scope}}
          }),
          `"configs.eslint.scope" with value "${scope}" fails to match the scope pattern`
        );
      });
    });

    suite('commitlint', () => {
      test('that `packageName` is required', () => assert.throws(
        () => validate({
          projectRoot: any.string(),
          projectName: any.string(),
          visibility: any.fromList(['Public', 'Private']),
          license: any.string(),
          vcs: {host: any.word(), owner: any.word(), name: any.word()},
          ci: any.string(),
          description: any.string(),
          configs: {commitlint: {}}
        }),
        '"configs.commitlint.packageName" is required'
      ));

      test('that `name` is required', () => assert.throws(
        () => validate({
          projectRoot: any.string(),
          projectName: any.string(),
          visibility: any.fromList(['Public', 'Private']),
          license: any.string(),
          vcs: {host: any.word(), owner: any.word(), name: any.word()},
          ci: any.string(),
          description: any.string(),
          configs: {commitlint: {packageName: any.string()}}
        }),
        '"configs.commitlint.name" is required'
      ));
    });

    suite('babel preset', () => {
      test('that `packageName` is required', () => assert.throws(
        () => validate({
          projectRoot: any.string(),
          projectName: any.string(),
          visibility: any.fromList(['Public', 'Private']),
          license: any.string(),
          vcs: {host: any.word(), owner: any.word(), name: any.word()},
          ci: any.string(),
          description: any.string(),
          configs: {babelPreset: {}}
        }),
        '"configs.babelPreset.packageName" is required'
      ));

      test('that `name` is required', () => assert.throws(
        () => validate({
          projectRoot: any.string(),
          projectName: any.string(),
          visibility: any.fromList(['Public', 'Private']),
          license: any.string(),
          vcs: {host: any.word(), owner: any.word(), name: any.word()},
          ci: any.string(),
          description: any.string(),
          configs: {babelPreset: {packageName: any.string()}}
        }),
        '"configs.babelPreset.name" is required'
      ));
    });

    suite('remark preset', () => {
      test('that the definition must be a string, when defined', () => assert.throws(
        () => validate({
          projectRoot: any.string(),
          projectName: any.string(),
          visibility: any.fromList(['Public', 'Private']),
          license: any.string(),
          vcs: {host: any.word(), owner: any.word(), name: any.word()},
          description: any.string(),
          configs: {remark: {}}
        }),
        '"configs.remark" must be a string'
      ));

      test('that the validation passes when a string is provided', () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        vcs: {host: any.word(), owner: any.word(), name: any.word()},
        description: any.string(),
        configs: {remark: any.string()},
        unitTestFrameworks: {}
      }));

      test('that the config is optional', () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        vcs: {host: any.word(), owner: any.word(), name: any.word()},
        description: any.string(),
        configs: {},
        unitTestFrameworks: {}
      }));
    });
  });

  suite('overrides', () => {
    const email = any.email();

    test('that `npmAccount` can be overridden', () => {
      validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        vcs: {host: any.word(), owner: any.word(), name: any.word()},
        description: any.string(),
        overrides: {npmAccount: any.word()},
        unitTestFrameworks: {}
      });
    });

    suite('author', () => {
      test('that `author` can be overridden', () => {
        validate({
          projectRoot: any.string(),
          projectName: any.string(),
          visibility: any.fromList(['Public', 'Private']),
          license: any.string(),
          vcs: {host: any.word(), owner: any.word(), name: any.word()},
          description: any.string(),
          overrides: {author: {name: any.string(), email, url: any.url()}},
          unitTestFrameworks: {}
        });
      });
    });

    test('that `author.name` is required', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        vcs: {host: any.word(), owner: any.word(), name: any.word()},
        description: any.string(),
        overrides: {author: {}}
      }),
      '"overrides.author.name" is required'
    ));

    test('that `author.email` must be an email address when provided', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        vcs: {host: any.word(), owner: any.word(), name: any.word()},
        description: any.string(),
        overrides: {author: {name: any.string(), email: any.word()}}
      }),
      '"overrides.author.email" must be a valid email'
    ));

    test('that `author.url` must be a valid uri when provided', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        vcs: {host: any.word(), owner: any.word(), name: any.word()},
        description: any.string(),
        overrides: {author: {name: any.string(), email, url: any.string()}}
      }),
      '"overrides.author.url" must be a valid uri'
    ));
  });

  suite('ci services', () => {
    const ciServiceName = any.word();

    test('that the scaffolder function is required', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        vcs: {host: any.word(), owner: any.word(), name: any.word()},
        description: any.string(),
        ciServices: {[ciServiceName]: {}}
      }),
      `"ciServices.${ciServiceName}.scaffolder" is required`
    ));

    test('that a provided ci-service scaffolder must accept a single argument', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        vcs: {host: any.word(), owner: any.word(), name: any.word()},
        description: any.string(),
        ciServices: {[ciServiceName]: {scaffolder: () => undefined}}
      }),
      `"ciServices.${ciServiceName}.scaffolder" must have an arity of 1`
    ));

    test('that a provided ci-service scaffolder can be enabled for public projects', () => validate({
      projectRoot: any.string(),
      projectName: any.string(),
      visibility: any.fromList(['Public', 'Private']),
      license: any.string(),
      vcs: {host: any.word(), owner: any.word(), name: any.word()},
      description: any.string(),
      ciServices: {[ciServiceName]: {scaffolder: options => options, public: any.boolean()}},
      unitTestFrameworks: {}
    }));

    test('that a provided ci-service scaffolder can be enabled for private projects', () => validate({
      projectRoot: any.string(),
      projectName: any.string(),
      visibility: any.fromList(['Public', 'Private']),
      license: any.string(),
      vcs: {host: any.word(), owner: any.word(), name: any.word()},
      description: any.string(),
      ciServices: {[ciServiceName]: {scaffolder: options => options, private: any.boolean()}},
      unitTestFrameworks: {}
    }));
  });

  suite('hosts', () => {
    const hostName = any.word();

    test('that the scaffolder function is required', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        vcs: {host: any.word(), owner: any.word(), name: any.word()},
        description: any.string(),
        hosts: {[hostName]: {}}
      }),
      `"hosts.${hostName}.scaffolder" is required`
    ));

    test('that a provided scaffolder must accept a single argument', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        vcs: {host: any.word(), owner: any.word(), name: any.word()},
        description: any.string(),
        hosts: {[hostName]: {scaffolder: () => undefined}}
      }),
      `"hosts.${hostName}.scaffolder" must have an arity of 1`
    ));

    // test('that provided `projectTypes` must be strings', () => assert.throws(
    //   () => validate({
    //     projectRoot: any.string(),
    //     projectName: any.string(),
    //     visibility: any.fromList(['Public', 'Private']),
    //     license: any.string(),
    //     vcs: {host: any.word(), owner: any.word(), name: any.word()},
    //     description: any.string(),
    //     hosts: {[hostName]: {scaffolder: options => options, projectTypes: [any.integer()]}}
    //   }),
    //   `"hosts.${hostName}.projectTypes[0]" must be a string`
    // ));

    test('that `projectTypes` must be valid types', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        vcs: {host: any.word(), owner: any.word(), name: any.word()},
        description: any.string(),
        hosts: {[hostName]: {scaffolder: options => options, projectTypes: [any.word()]}}
      }),
      `"hosts.${hostName}.projectTypes[0]" must be one of [static, node]`
    ));

    test('that `static` is a valid option for `projectTypes`', () => validate({
      projectRoot: any.string(),
      projectName: any.string(),
      visibility: any.fromList(['Public', 'Private']),
      license: any.string(),
      vcs: {host: any.word(), owner: any.word(), name: any.word()},
      description: any.string(),
      hosts: {[hostName]: {scaffolder: options => options, projectTypes: ['static']}},
      unitTestFrameworks: {}
    }));

    test('that `node` is a valid option for `projectTypes`', () => validate({
      projectRoot: any.string(),
      projectName: any.string(),
      visibility: any.fromList(['Public', 'Private']),
      license: any.string(),
      vcs: {host: any.word(), owner: any.word(), name: any.word()},
      description: any.string(),
      hosts: {[hostName]: {scaffolder: options => options, projectTypes: ['node']}},
      unitTestFrameworks: {}
    }));

    test('that `projectTypes` defaults to an empty list`', () => {
      const validated = validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        vcs: {host: any.word(), owner: any.word(), name: any.word()},
        description: any.string(),
        hosts: {[hostName]: {scaffolder: options => options}},
        unitTestFrameworks: {}
      });

      assert.deepEqual(validated.hosts[hostName].projectTypes, []);
    });
  });

  suite('application types', () => {
    const key = any.word();

    test('that a provided application-type must define config', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        applicationTypes: {[key]: any.word()}
      }),
      `"applicationTypes.${key}" must be of type object`
    ));

    test('that a provided application-type must provide a scaffolded', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        applicationTypes: {[key]: {}}
      }),
      `"applicationTypes.${key}.scaffolder" is required`
    ));

    test('that a provided application-type must provide a scaffold function', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        applicationTypes: {[key]: {scaffolder: any.word()}}
      }),
      `"applicationTypes.${key}.scaffolder" must be of type function`
    ));

    test('that a provided application-type scaffolder must accept a single argument', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        applicationTypes: {[key]: {scaffolder: () => undefined}}
      }),
      `"applicationTypes.${key}.scaffolder" must have an arity of 1`
    ));

    test('that a provided application-type scaffolder is valid if an options object is provided', () => validate({
      projectRoot: any.string(),
      projectName: any.string(),
      visibility: any.fromList(['Public', 'Private']),
      license: any.string(),
      applicationTypes: {[key]: {scaffolder: options => options}},
      unitTestFrameworks: {}
    }));
  });

  suite('package types', () => {
    const key = any.word();

    test('that a provided package-type must define config', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        packageTypes: {[key]: any.word()}
      }),
      `"packageTypes.${key}" must be of type object`
    ));

    test('that a provided package-type must provide a scaffolded', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        packageTypes: {[key]: {}}
      }),
      `"packageTypes.${key}.scaffolder" is required`
    ));

    test('that a provided package-type must provide a scaffold function', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        packageTypes: {[key]: {scaffolder: any.word()}}
      }),
      `"packageTypes.${key}.scaffolder" must be of type function`
    ));

    test('that a provided package-type scaffolder must accept a single argument', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        packageTypes: {[key]: {scaffolder: () => undefined}}
      }),
      `"packageTypes.${key}.scaffolder" must have an arity of 1`
    ));

    test('that a provided package-type scaffolder is valid if an options object is provided', () => validate({
      projectRoot: any.string(),
      projectName: any.string(),
      visibility: any.fromList(['Public', 'Private']),
      license: any.string(),
      packageTypes: {[key]: {scaffolder: options => options}},
      unitTestFrameworks: {}
    }));
  });

  test(
    'that `configs`, `overrides`, `hosts`, `ciServices`, `applicationTypes`, and `packageTypes`'
    + ' default to empty objects',
    () => {
      const options = {
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        vcs: {host: any.word(), owner: any.word(), name: any.word()},
        description: any.string(),
        unitTestFrameworks: {}
      };

      const validated = validate(options);

      assert.deepEqual(
        validated,
        {...options, configs: {}, overrides: {}, ciServices: {}, hosts: {}, applicationTypes: {}, packageTypes: {}}
      );
    }
  );

  test('that `decisions` is allowed', () => {
    const options = {
      projectRoot: any.string(),
      projectName: any.string(),
      visibility: any.fromList(['Public', 'Private']),
      license: any.string(),
      decisions: any.simpleObject(),
      unitTestFrameworks: {}
    };

    validate(options);
  });
});
