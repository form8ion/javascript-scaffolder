Feature: Monorepo

  Scenario: Add package to existing monorepo
    Given the project will be a "Package"
    And the package will be added to an existing monorepo
    And the project will be versioned on GitHub
    And the default answers are chosen
    And nvm is properly configured
    And the npm cli is logged in
    And a babel preset is provided
    When the project is scaffolded
    Then the repository details include the path within the parent project
    And project-level tools are not installed for a sub-project
    And the expected files for a "package" are generated
    And the expected results for a "package" are returned to the project scaffolder
