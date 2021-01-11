Feature: Package Project Type

  Scenario: Minimal Options w/o Versioning
    Given the project will be a "Package"
    And the project will not be versioned
    And the project will have "Private" visibility
    And the default answers are chosen
    And the npm cli is logged in
    And nvm is properly configured
    When the project is scaffolded
    Then no repository details will be defined
    And the expected details are provided for a root-level project
    And the expected files for a "package" are generated
    And the expected results for a "Package" are returned to the project scaffolder

  Scenario: Minimal Options w/ Versioning
    Given the project will be a "Package"
    And the project will be versioned on GitHub
    And the project will have "Public" visibility
    And the default answers are chosen
    And the npm cli is logged in
    And nvm is properly configured
    When the project is scaffolded
    Then repository details will be defined using the shorthand
    And the expected details are provided for a root-level project
    And the expected files for a "package" are generated
    And the expected results for a "Package" are returned to the project scaffolder

  Scenario: Without testing, transpilation, or linting
    Given the project will be a "Package"
    And the project will be versioned on GitHub
    And the npm cli is logged in
    And nvm is properly configured
    And the project will not be tested
    And the project will not be transpiled or linted
    When the project is scaffolded
    Then repository details will be defined using the shorthand
    And the expected details are provided for a root-level project
    And the expected files for a "package" are generated
    And Babel and ESLint are not scaffolded
