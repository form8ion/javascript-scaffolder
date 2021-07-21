Feature: Dialects

  Scenario: Babel
    Given the project will be an "any"
    And the npm cli is logged in
    And the project will not be tested
    And nvm is properly configured
    And a babel preset is provided
    When the project is scaffolded
    Then the "babel" dialect is configured

  @wip
  Scenario: Babel without a preset provided
    Given the project will be an "any"
    And the npm cli is logged in
    And the project will not be tested
    And nvm is properly configured
    And no babel preset is provided
    When the project is scaffolded
    Then an error is reported about the missing babel preset

  @wip
  Scenario: Common JS
    Given the project will be an "any"
    And the npm cli is logged in
    And the project will not be tested
    And nvm is properly configured
    When the project is scaffolded

  @wip
  Scenario: EcmaScript Module
    Given the project will be an "any"
    And the npm cli is logged in
    And the project will not be tested
    And nvm is properly configured
    When the project is scaffolded

  @wip
  Scenario: TypeScript
    Given the project will be an "any"
    And the npm cli is logged in
    And the project will not be tested
    And nvm is properly configured
    When the project is scaffolded
