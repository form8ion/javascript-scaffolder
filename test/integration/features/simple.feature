Feature: Simplest Use

  Scenario: Minimal Options
    Given the default answers are chosen
    And the npm cli is logged in
    And nvm is properly configured
    When the project is scaffolded
    Then the expected files are generated
