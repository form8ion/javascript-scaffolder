Feature: Package manager

  Scenario: npm
    Given the project will be an "any"
    And the project will use the "babel" dialect
    And the npm cli is logged in
    And nvm is properly configured
    And the project will not be tested
    When the project is scaffolded
    Then the npm cli is configured for use
    And husky is configured for a "npm" project
    And the expected results for an "any" are returned to the project scaffolder

  Scenario: yarn
    Given the project will be an "any"
    And the project will use the "babel" dialect
    And the yarn cli is logged in
    And nvm is properly configured
    And the project will not be tested
    When the project is scaffolded
    Then the yarn cli is configured for use
    And husky is configured for a "yarn" project
    And the expected results for an "any" are returned to the project scaffolder

  Scenario: yarn package
    Given the project will be an "Package"
    And the project will use the "babel" dialect
    And the yarn cli is logged in
    And nvm is properly configured
    And the project will not be tested
    When the project is scaffolded
    Then the yarn cli is configured for use
    And the expected results for an "Package" are returned to the project scaffolder
