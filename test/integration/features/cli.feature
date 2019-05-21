Feature: CLI Project Type

  Scenario: Minimal Options for a CLI
    Given the project will be a "cli"
    And the project will be versioned
    And the default answers are chosen
    And the npm cli is logged in
    And nvm is properly configured
    When the project is scaffolded
    Then the expected files for a "cli" are generated
    And the expected results for a "cli" are returned to the project scaffolder
