Feature: Registries

  @wip
  Scenario: registries defined for scopes
    Given the project will be an "any"
    And the npm cli is logged in
    And the project will not be tested
    And nvm is properly configured
    And registries are defined for scopes
    When the project is scaffolded
    Then the registry configuration is defined
