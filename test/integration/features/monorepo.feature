Feature: Monorepo

  Scenario: Add package to existing monorepo
    Given the project will be a "Package"
    And the project will use the "babel" dialect
    And the package will be added to an existing monorepo
    And the project will be versioned on GitHub
    And the default answers are chosen
    And nvm is properly configured
    And the npm cli is logged in
    And a babel preset is provided
    When the project is scaffolded
    Then the repository details include the path within the parent project
    And project-level tools are not installed for a sub-project
    And the expected files for a "Package" are generated
    And the expected results for a "Package" are returned to the project scaffolder

  Scenario: Create new monorepo
    Given the project will be a "Monorepo"
    And the chosen monorepo plugin defines scripts
    And the project will use the "common-js" dialect
    And the npm cli is logged in
    And nvm is properly configured
    And the project will not be tested
    When the project is scaffolded
    Then no error is thrown
    And the monorepo scripts are included
    And the expected results for a "Monorepo" are returned to the project scaffolder
