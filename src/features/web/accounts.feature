@web @accounts
Feature: Account services validation


@checking_account_opening
Scenario: Checking account opening success
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I click on the open new account link
    And I "click" on the "open new account" "button"
    Then I validate the "success message"


@savings_account_opening
Scenario: Savings account opening success
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I click on the open new account link
    And I "click" on the "savings" "drop down"
    And I "click" on the "open new account" "button"
    Then I validate the "success message"