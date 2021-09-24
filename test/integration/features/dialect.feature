Feature: Dialects

  Scenario: Babel
    Given the project will be a "Package"
    And the project will use the "babel" dialect
    And the npm cli is logged in
    And the project will not be tested
    And nvm is properly configured
    And a babel preset is provided
    When the project is scaffolded
    Then the "babel" dialect is configured

  Scenario: Babel without a preset provided
    Given the project will be a "Package"
    And the project will use the "babel" dialect
    And the npm cli is logged in
    And the project will not be tested
    And nvm is properly configured
    And no babel preset is provided
    When the project is scaffolded
    Then an error is reported about the missing babel preset

  Scenario: Common JS
    Given the project will be an "any"
    And the project will use the "common-js" dialect
    And the npm cli is logged in
    And the project will not be tested
    And nvm is properly configured
    And a babel preset is provided
    When the project is scaffolded
    Then no error is thrown
    And the "common-js" dialect is configured

  @wip
  Scenario: EcmaScript Module
    Given the project will be an "any"
    And the project will use the "esm" dialect
    And the npm cli is logged in
    And the project will not be tested
    And nvm is properly configured
    And a babel preset is provided
    When the project is scaffolded
    Then no error is thrown
    And the "esm" dialect is configured

  Scenario: TypeScript
    Given the project will be an "any"
    And the project will use the "typescript" dialect
    And the default answers are chosen
    And the npm cli is logged in
    And the project will not be tested
    And nvm is properly configured
    And a babel preset is provided
    When the project is scaffolded
    Then no error is thrown
    And the "typescript" dialect is configured

  Scenario: TypeScript with unit tests
    Given the project will be an "any"
    And the project will use the "typescript" dialect
    And the default answers are chosen
    And the npm cli is logged in
    And nvm is properly configured
    And a babel preset is provided
    When the project is scaffolded
    Then no error is thrown
    And the "typescript" dialect is configured

  Scenario: TypeScript package
    Given the project will be a "Package"
    And the project will use the "typescript" dialect
    And the default answers are chosen
    And the npm cli is logged in
    And the project will not be tested
    And nvm is properly configured
    And a babel preset is provided
    When the project is scaffolded
    Then no error is thrown
    And the "typescript" dialect is configured
    And the package is bundled with rollup
