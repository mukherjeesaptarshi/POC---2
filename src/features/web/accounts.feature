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
    And I validate the "checking account in accounts overview"


@savings_account_opening
Scenario: Savings account opening success
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I click on the open new account link
    And I "click" on the "savings" "drop down"
    And I "click" on the "open new account" "button"
    Then I validate the "success message"
    And I validate the "savings account in accounts overview"


@five_accounts_sequential
Scenario: Open 5 accounts sequentially for one customer
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I open 5 new accounts sequentially
    Then I validate the "accounts overview total matches individual balances"


@accounts_overview_reconciliation
Scenario: Accounts Overview total equals sum of all balances
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I open 5 new accounts sequentially
    Then the Accounts Overview total equals the sum of all individual balances


@insufficient_funding_account_opening
Scenario: Attempt to open an account with insufficient funding balance
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I click on the open new account link
    And I attempt to open an account with insufficient funding balance
    Then I validate the "insufficient funding error message"