Feature: ESLint

  Scenario: Simple Project
    Given the project will be an "any"
    And the npm cli is logged in
    And the project will not be tested
    And nvm is properly configured
    When the project is scaffolded
    Then the base ESLint config is extended
