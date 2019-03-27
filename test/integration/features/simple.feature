Feature: Simplest Use

  Scenario: Minimal Options w/o Versioning
    Given the project will not be versioned
    And the default answers are chosen
    And the npm cli is logged in
    And nvm is properly configured
    When the project is scaffolded
    Then the expected files are generated

  Scenario: Minimal Options w/ Versioning
    Given the project will be versioned
    And the default answers are chosen
    And the npm cli is logged in
    And nvm is properly configured
    When the project is scaffolded
    Then the expected files are generated

  Scenario: Without testing, transpilation, or linting
    Given the project will be versioned
    And the npm cli is logged in
    And nvm is properly configured
    And the project will not be tested
    And the project will not be transpiled or linted
    When the project is scaffolded
#    Then the expected files are generated
    And Babel and ESLint are not scaffolded
