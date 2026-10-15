@web @customer_account
Feature: Customer account recovery and profile maintenance

  @TC-81
  Scenario: Retrieve credentials with valid customer details
    Given I open the web registration page
    And I have registered a new web customer
    And I "click" on the "logout" "button"
    When I open the customer lookup page
    And I find login info using my registered customer details
    Then the recovered login credentials should be displayed

  @TC-82
  Scenario: Forgot login requires first name
    Given I open the web registration page
    And I have registered a new web customer
    And I "click" on the "logout" "button"
    When I open the customer lookup page
    And I find login info leaving the "first name" field blank
    Then the lookup form should require the "first name" field

  @TC-83
  Scenario: Forgot login requires last name
    Given I open the web registration page
    And I have registered a new web customer
    And I "click" on the "logout" "button"
    When I open the customer lookup page
    And I find login info leaving the "last name" field blank
    Then the lookup form should require the "last name" field

  @TC-84
  Scenario: Forgot login requires address
    Given I open the web registration page
    And I have registered a new web customer
    And I "click" on the "logout" "button"
    When I open the customer lookup page
    And I find login info leaving the "address" field blank
    Then the lookup form should require the "address" field

  @TC-85
  Scenario: Incorrect customer details are rejected
    Given I open the web registration page
    And I have registered a new web customer
    And I "click" on the "logout" "button"
    When I open the customer lookup page
    And I search login info with incorrect customer details
    Then the lookup should report that the customer was not found

  @TC-86
  Scenario: Leading and trailing spaces in lookup fields are accepted
    Given I open the web registration page
    And I have registered a new web customer
    And I "click" on the "logout" "button"
    When I open the customer lookup page
    And I search login info with whitespace-padded customer details
    Then the recovered login credentials should be displayed

  @TC-87
  Scenario: Updated phone number persists after signing in again
    Given I open the web registration page
    And I have registered a new web customer
    When I update my profile phone number to "0400111222"
    Then the profile update should be saved
    When I log out and sign back in
    Then the saved profile values should be retained

  @TC-88
  Scenario: Updated address is retained
    Given I open the web registration page
    And I have registered a new web customer
    When I update my profile address to "99 New Street"
    Then the profile update should be saved
    When I log out and sign back in
    Then the saved profile values should be retained

  @TC-89
  Scenario Outline: Blank mandatory profile field is rejected
    Given I open the web registration page
    And I have registered a new web customer
    When I submit my profile with the "<field>" field blank
    Then the profile should show the required validation for "<field>"

    Examples:
      | field      |
      | first name |
      | last name  |
      | address    |
      | city       |
      | state      |
      | zip code   |
      | phone number |

  @TC-90
  Scenario: Invalid ZIP code shows validation
    Given I open the web registration page
    And I have registered a new web customer
    When I update my profile ZIP code to "ABCDE"
    Then the profile should show ZIP code validation

  @TC-91
  Scenario: Multiple profile updates persist after signing in again
    Given I open the web registration page
    And I have registered a new web customer
    When I update multiple profile fields
    Then the profile update should be saved
    When I log out and sign back in
    Then the saved profile values should be retained