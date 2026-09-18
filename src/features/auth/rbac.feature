@api @authorization @rbac
Feature: Role-based authorization

  Scenario: Customer cannot access operations audit data
    Given I am authenticated as "alice"
    When I request the operations audit endpoint
    And the API response status should be 403
    Then the API error code should be "ROLE_ACCESS_DENIED"

  Scenario: Operations user can access audit data
    Given I am authenticated as "operator"
    When I request the operations audit endpoint
    And the API response status should be 200
    Then the operations audit response identifies the "OPERATIONS" role