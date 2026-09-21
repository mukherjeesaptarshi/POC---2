@web @login
Feature: Web login validation

  Scenario: Login succeeds with valid registered credentials
    Given I have registered a new web customer
    And I log out of the web application
    When I log in with the registered web credentials
    Then the web Accounts Overview should show a default account with a non-null balance

  Scenario: Login is rejected with invalid credentials
    Given I open the web login page
    When I log in to the web application with username "unknown-web-user" and password "WrongPassword123!"
    Then the web login should be rejected

  Scenario: Login is rejected with blank credentials
    Given I open the web login page
    When I log in to the web application with username "" and password ""
    Then the web login should be rejected