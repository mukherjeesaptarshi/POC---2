@web @login
Feature: Web login validation


  @successful_login
  Scenario: Login succeeds with valid registered credentials
    Given I open the web registration page
    When I have registered a new web customer
    And I "click" on the "logout" "button"
    And I log in with the registered web credentials
    Then the web Accounts Overview should show a default account with a non-null balance


  @login_invalid_credentials
  Scenario: Login is rejected with invalid credentials
    Given I open the web login page
    When I log in to the web application with username "unknown-web-user" and password "WrongPassword123!"
    Then I validate the "rejection message"


  @login_blank_username
  Scenario: Login is rejected with invalid credentials
    Given I open the web login page
    When I log in to the web application with username "" and password "WrongPassword123!"
    Then I validate the "rejection message"


  @login_blank_password
  Scenario: Login is rejected with invalid credentials
    Given I open the web login page
    When I log in to the web application with username "unknown-web-user" and password ""
    Then I validate the "rejection message"


  @blank_login
  Scenario: Login is rejected with blank credentials
    Given I open the web login page
    When I log in to the web application with username "" and password ""
    Then I validate the "blank rejection message"


  @multiple_login
  Scenario: Login succeeds with valid registered credentials
    Given I open the web registration page
    When I have registered a new web customer
    And I "click" on the "logout" "button"
    And I log in with the registered web credentials
    And the web Accounts Overview should show a default account with a non-null balance
    #And I open the web registration page
    #And I have registered a new web customer
    #And I "click" on the "logout" "button"
    #And I log in with the registered web credentials
    #Then the web Accounts Overview should show a default account with a non-null balance