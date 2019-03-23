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
