@web @account_activity
Feature: Account activity and details

  @TC-92
  Scenario: Open account details page
    Given I open the web registration page
    And I have registered a new web customer
    Then the default account details should be displayed

  @TC-94
  Scenario: Verify opening balance visibility
    Given I open the web registration page
    And I have registered a new web customer
    Then the opening balance should reconcile with account activity