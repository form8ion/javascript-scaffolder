Feature: Application Project Type

  Scenario: Minimal Options for an Application
    Given the project will be an "Application"
    And the project will be versioned on GitHub
    And the default answers are chosen
    And the project will have "Public" visibility
    And the npm cli is logged in
    And nvm is properly configured
    And a babel preset is provided
    When the project is scaffolded
    And the expected details are provided for a root-level project
    Then the expected files for an "application" are generated
    And repository details will be defined using the shorthand
    And the expected results for an "Application" are returned to the project scaffolder
