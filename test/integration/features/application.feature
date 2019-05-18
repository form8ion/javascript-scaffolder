Feature: Application Project Type

  Scenario: Minimal Options for an Application
    Given the project will be an "application"
    And the project will be versioned
    And the default answers are chosen
    And the npm cli is logged in
    And nvm is properly configured
    When the project is scaffolded
    Then the expected files are generated
    And the expected results for an "application" are returned to the project scaffolder
