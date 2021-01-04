Feature: Package manager

  Scenario: npm
    Given the project will be an "any"
    And the npm cli is logged in
    And nvm is properly configured
    And the project will not be tested
    When the project is scaffolded
    Then the npm cli is configured for use

  @wip
  Scenario: yarn
    Given the project will be an "any"
    And the yarn cli is logged in
    And nvm is properly configured
    And the project will not be tested
    When the project is scaffolded
    Then the yarn cli is configured for use
