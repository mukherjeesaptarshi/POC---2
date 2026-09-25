@web @transfer_funds
Feature: Transfer Funds Process


@transfer_funds_blank
Scenario: Transfer funds without entering any values
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I click on the transfer funds link
    And I "click" on the "transfer" "button"
    Then I validate the "transfer fund error message"


@transfer_funds_same_acc
Scenario: Transfer funds in same account
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I click on the transfer funds link
    And I enter "100" in the "amount" textbox
    And I "click" on the "transfer" "button"
    Then I validate the "transfer complete message"


@transfer_funds_different_acc
Scenario: Transfer funds in different accounts
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"    
    And I click on the open new account link
    And I "click" on the "savings" "drop down"
    And I "click" on the "open new account" "button"
    And I validate the "success message"
    And I click on the transfer funds link
    And I enter "100" in the "amount" textbox
    And I select the "second option" from the "to account" dropdown
    And I "click" on the "transfer" "button"
    And I validate the "transfer complete message"
    Then I validate the debit and credit in both accounts


@transfer_full_available_balance
Scenario: Transfer the full available balance to zero out an account
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I click on the open new account link
    And I "click" on the "savings" "drop down"
    And I "click" on the "open new account" "button"
    And I validate the "success message"
    And I click on the transfer funds link
    And I transfer the full available balance to the second account
    Then I validate the source account balance is zero


@transfer_invalid_amounts
Scenario Outline: Reject invalid transfer amount <variant>
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I click on the open new account link
    And I "click" on the "savings" "drop down"
    And I "click" on the "open new account" "button"
    And I validate the "success message"
    And I click on the transfer funds link
    And I attempt to transfer "<amount>" to the second account
    Then I validate the transfer amount is rejected

    Examples:
      | variant              | amount  |
      | exceeding balance    | 600.00  |
      | negative amount      | -1.00   |
      | zero amount          | 0       |
      | non-numeric amount   | abc     |
      | more than two cents  | 1.001   |


@transfer_same_account_rejected
Scenario: Reject transfer from an account to itself
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I click on the transfer funds link
    And I attempt a same-account transfer of "10.00"
    Then I validate the same-account transfer is rejected


@transfer_rapid_sequential
Scenario: Complete 10 rapid transfers and reconcile balances and ledger rows
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I click on the open new account link
    And I "click" on the "savings" "drop down"
    And I "click" on the "open new account" "button"
    And I validate the "success message"
    And I click on the transfer funds link
    And I perform 10 rapid transfers of "10.00" to the second account
    Then I validate the final balance is opening balance minus the transferred amounts
    And I validate 20 ledger rows exist with 10 debits and 10 credits