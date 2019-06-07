import any from '@travi/any';
import {assert} from 'chai';
import {validate} from '../../src/options-validator';

suite('options validator', () => {
  test('that the options are required', () => assert.throws(() => validate(), '"value" is required'));

  test('that the `projectRoot` is required', () => {
    assert.throws(() => validate({}), 'child "projectRoot" fails because ["projectRoot" is required]');
  });

  test('that the `projectName` is required', () => assert.throws(
    () => validate({projectRoot: any.string()}),
    'child "projectName" fails because ["projectName" is required]'
  ));

  test('that the `projectName` should not include a scope', () => {
    const projectName = `@${any.word()}/${any.word()}`;

    assert.throws(
      () => validate({projectRoot: any.string(), projectName}),
      'child "projectName" fails because ' +
      `["projectName" with value "${projectName}" matches the inverted pattern: /^@\\w*\\//]`
    );
  });

  suite('visibility', () => {
    test('that the `visibility` is required', () => assert.throws(
      () => validate({projectRoot: any.string(), projectName: any.string()}),
      'child "visibility" fails because ["visibility" is required]'
    ));

    test('that `Public` is an allowed `visibility`', () => validate({
      projectRoot: any.string(),
      projectName: any.string(),
      visibility: 'Public',
      license: any.string(),
      vcs: {host: any.word(), owner: any.word(), name: any.word()},
      description: any.string()
    }));

    test('that `Private` is an allowed `visibility`', () => validate({
      projectRoot: any.string(),
      projectName: any.string(),
      visibility: 'Private',
      license: any.string(),
      vcs: {host: any.word(), owner: any.word(), name: any.word()},
      description: any.string()
    }));

    test('that `visibility` values other than `Public` or `Private` are invalid', () => assert.throws(
      () => validate({projectRoot: any.string(), projectName: any.string(), visibility: any.word()}),
      'child "visibility" fails because ["visibility" must be one of [Public, Private]]'
    ));
  });

  test('that `license` is required', () => assert.throws(
    () => validate({
      projectRoot: any.string(),
      projectName: any.string(),
      visibility: any.fromList(['Public', 'Private'])
    }),
    'child "license" fails because ["license" is required]'
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
      'child "host" fails because ["host" is required]'
    ));

    test('that `vcs.owner` is required', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        vcs: {host: any.word()}
      }),
      'child "owner" fails because ["owner" is required]'
    ));

    test('that `vcs.name` is required', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        vcs: {host: any.word(), owner: any.word()}
      }),
      'child "name" fails because ["name" is required]'
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
        'child "scope" fails because ["scope" is required]'
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
        'child "scope" fails because ["scope" must be a string]'
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
          `child "scope" fails because ["scope" with value "${scope}" fails to match the scope pattern]`
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
          `child "scope" fails because ["scope" with value "${scope}" fails to match the scope pattern]`
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
        'child "packageName" fails because ["packageName" is required]'
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
        'child "name" fails because ["name" is required]'
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
        'child "packageName" fails because ["packageName" is required]'
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
        'child "name" fails because ["name" is required]'
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
        'child "configs" fails because [child "remark" fails because ["remark" must be a string]]'
      ));

      test('that the validation passes when a string is provided', () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        vcs: {host: any.word(), owner: any.word(), name: any.word()},
        description: any.string(),
        configs: {remark: any.string()}
      }));

      test('that the config is optional', () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        vcs: {host: any.word(), owner: any.word(), name: any.word()},
        description: any.string(),
        configs: {}
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
        overrides: {npmAccount: any.word()}
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
          overrides: {author: {name: any.string(), email, url: any.url()}}
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
      'child "overrides" fails because [child "author" fails because [child "name" fails because ["name" is required]]]'
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
      'child "overrides" fails because' +
      ' [child "author" fails because [child "email" fails because ["email" must be a valid email]]]'
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
      'child "overrides" fails because' +
      ' [child "author" fails because [child "url" fails because ["url" must be a valid uri]]]'
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
      `child "ciServices" fails because [child "${ciServiceName}" fails because ` +
      '[child "scaffolder" fails because ["scaffolder" is required]]]'
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
      `child "ciServices" fails because [child "${ciServiceName}" fails because ` +
      '[child "scaffolder" fails because ["scaffolder" must have an arity of 1]]]'
    ));

    test('that a provided ci-service scaffolder can be enabled for public projects', () => validate({
      projectRoot: any.string(),
      projectName: any.string(),
      visibility: any.fromList(['Public', 'Private']),
      license: any.string(),
      vcs: {host: any.word(), owner: any.word(), name: any.word()},
      description: any.string(),
      ciServices: {[ciServiceName]: {scaffolder: options => options, public: any.boolean()}}
    }));

    test('that a provided ci-service scaffolder can be enabled for private projects', () => validate({
      projectRoot: any.string(),
      projectName: any.string(),
      visibility: any.fromList(['Public', 'Private']),
      license: any.string(),
      vcs: {host: any.word(), owner: any.word(), name: any.word()},
      description: any.string(),
      ciServices: {[ciServiceName]: {scaffolder: options => options, private: any.boolean()}}
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
      `child "hosts" fails because [child "${hostName}" fails because ` +
      '[child "scaffolder" fails because ["scaffolder" is required]]]'
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
      `child "hosts" fails because [child "${hostName}" fails because ` +
      '[child "scaffolder" fails because ["scaffolder" must have an arity of 1]]]'
    ));

    test('that provided `projectTypes` must be strings', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        vcs: {host: any.word(), owner: any.word(), name: any.word()},
        description: any.string(),
        hosts: {[hostName]: {scaffolder: options => options, projectTypes: [any.integer()]}}
      }),
      `child "hosts" fails because [child "${hostName}" fails because ` +
      '[child "projectTypes" fails because ["projectTypes" at position 0 fails because ["0" must be a string]]]'
    ));

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
      `child "hosts" fails because [child "${hostName}" fails because ` +
      '[child "projectTypes" fails because ["projectTypes" at position 0 fails because ' +
      '["0" must be one of [static, node]]]]'
    ));

    test('that `static` is a valid option for `projectTypes`', () => validate({
      projectRoot: any.string(),
      projectName: any.string(),
      visibility: any.fromList(['Public', 'Private']),
      license: any.string(),
      vcs: {host: any.word(), owner: any.word(), name: any.word()},
      description: any.string(),
      hosts: {[hostName]: {scaffolder: options => options, projectTypes: ['static']}}
    }));

    test('that `node` is a valid option for `projectTypes`', () => validate({
      projectRoot: any.string(),
      projectName: any.string(),
      visibility: any.fromList(['Public', 'Private']),
      license: any.string(),
      vcs: {host: any.word(), owner: any.word(), name: any.word()},
      description: any.string(),
      hosts: {[hostName]: {scaffolder: options => options, projectTypes: ['node']}}
    }));

    test('that `projectTypes` defaults to an empty list`', () => {
      const validated = validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        vcs: {host: any.word(), owner: any.word(), name: any.word()},
        description: any.string(),
        hosts: {[hostName]: {scaffolder: options => options}}
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
      `child "applicationTypes" fails because [child "${key}" fails because ["${key}" must be an object]]`
    ));

    test('that a provided application-type must provide a scaffolded', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        applicationTypes: {[key]: {}}
      }),
      // eslint-disable-next-line max-len
      `child "applicationTypes" fails because [child "${key}" fails because [child "scaffolder" fails because ["scaffolder" is required]]]`
    ));

    test('that a provided application-type must provide a scaffold function', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        applicationTypes: {[key]: {scaffolder: any.word()}}
      }),
      // eslint-disable-next-line max-len
      `child "applicationTypes" fails because [child "${key}" fails because [child "scaffolder" fails because ["scaffolder" must be a Function]]]`
    ));

    test('that a provided application-type scaffolder must accept a single argument', () => assert.throws(
      () => validate({
        projectRoot: any.string(),
        projectName: any.string(),
        visibility: any.fromList(['Public', 'Private']),
        license: any.string(),
        applicationTypes: {[key]: {scaffolder: () => undefined}}
      }),
      // eslint-disable-next-line max-len
      `child "applicationTypes" fails because [child "${key}" fails because [child "scaffolder" fails because ["scaffolder" must have an arity of 1]]]`
    ));

    test('that a provided application-type scaffolder is valid if an options object is provided', () => validate({
      projectRoot: any.string(),
      projectName: any.string(),
      visibility: any.fromList(['Public', 'Private']),
      license: any.string(),
      applicationTypes: {[key]: {scaffolder: options => options}}
    }));
  });

  test('that `configs`, `overrides`, `hosts`, `ciServices`, and `applicationTypes` default to empty objects', () => {
    const options = {
      projectRoot: any.string(),
      projectName: any.string(),
      visibility: any.fromList(['Public', 'Private']),
      license: any.string(),
      vcs: {host: any.word(), owner: any.word(), name: any.word()},
      description: any.string()
    };

    const validated = validate(options);

    assert.deepEqual(
      validated,
      {...options, configs: {}, overrides: {}, ciServices: {}, hosts: {}, applicationTypes: {}}
    );
  });
});
