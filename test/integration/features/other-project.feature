Feature: "Other" Project-Type

  Scenario: Scaffold "Other" project-type
    Given the project will be a "Other"
    And the project will use the "common-js" dialect
    And the npm cli is logged in
    And nvm is properly configured
    And the project will not be tested
    When the project is scaffolded
    Then no error is thrown
