Feature: ESLint

  Scenario: Base Config only
    Given the project will be an "any"
    And the npm cli is logged in
    And the project will not be tested
    And nvm is properly configured
    When the project is scaffolded
    Then the base ESLint config is extended

  Scenario: Base Config with Additional Config
    Given the project will be an "any"
    And the npm cli is logged in
    And the project will not be tested
    And nvm is properly configured
    And the chosen unit-test framework defines simple ESLint configs
    When the project is scaffolded
    Then the base ESLint config is extended
    And the additional ESLint configs are extended

  Scenario: Base Config with Override Config
    Given the project will be an "Application"
    And the npm cli is logged in
    And the project will not be tested
    And nvm is properly configured
    And the chosen application plugin defines override ESLint configs
    When the project is scaffolded
    Then the base ESLint config is extended
    And the ESLint overrides are defined
