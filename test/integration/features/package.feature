Feature: Package Project Type

  Scenario: Minimal Options w/o Version Control
    Given the project will be a "Package"
    And the project will use the "babel" dialect
    And the project will not be versioned
    And the project will have "Private" visibility
    And the default answers are chosen
    And the npm cli is logged in
    And nvm is properly configured
    And a babel preset is provided
    When the project is scaffolded
    Then no repository details will be defined
    And the expected details are provided for a root-level project
    And the expected files for a "Package" are generated
    And the package is bundled with rollup
    And the expected results for a "Package" are returned to the project scaffolder

  Scenario: Minimal Options w/ Version Control
    Given the project will be a "Package"
    And the project will use the "babel" dialect
    And the project will be versioned on GitHub
    And the project will have "Public" visibility
    And the default answers are chosen
    And the npm cli is logged in
    And nvm is properly configured
    And a babel preset is provided
    When the project is scaffolded
    Then repository details will be defined using the shorthand
    And the expected details are provided for a root-level project
    And the expected files for a "Package" are generated
    And the expected results for a "Package" are returned to the project scaffolder

  Scenario: Typescript Package
    Given the project will be a "Package"
    And the project will use the "typescript" dialect
    And the project will be versioned on GitHub
    And the project will have "Public" visibility
    And the default answers are chosen
    And the npm cli is logged in
    And nvm is properly configured
    And a babel preset is provided
    When the project is scaffolded
    Then the expected files for a "Package" are generated
    And the expected results for a "Package" are returned to the project scaffolder

  Scenario: ESM-only Package
    Given the project will be a "Package"
    And the project will use the "esm" dialect
    And the project will be versioned on GitHub
    And the project will have "Public" visibility
    And the default answers are chosen
    And the npm cli is logged in
    And nvm is properly configured
    And a babel preset is provided
    When the project is scaffolded
    Then the expected files for a "Package" are generated
    And the expected results for a "Package" are returned to the project scaffolder

  Scenario: Simple Common JS package
    Given the project will be a "Package"
    And the project will use the "common-js" dialect
    And the project will be versioned on GitHub
    And the npm cli is logged in
    And nvm is properly configured
    And the project will not be tested
    And a babel preset is provided
    But the project will not be transpiled or linted
    When the project is scaffolded
    Then repository details will be defined using the shorthand
    And the expected details are provided for a root-level project
    And the expected files for a "Package" are generated
    And Babel and ESLint are not scaffolded
