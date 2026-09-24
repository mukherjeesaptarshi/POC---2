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


@bill_pay_success
Scenario: Send Payment with all values
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I click on the bill pay link
    And I fill all bill payment details
    And I "click" on the "send payment" "button"
    Then I validate the "bill pay success message"


@bill_pay_blank_payee_name
Scenario: Send Payment with blank payee name
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I click on the bill pay link
    And I fill all bill payment details except the "payee name" field
    And I "click" on the "send payment" "button"
    Then I validate the "bill pay blank payee name error message"


@bill_pay_blank_address
Scenario: Send Payment with blank address
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I click on the bill pay link
    And I fill all bill payment details except the "address" field
    And I "click" on the "send payment" "button"
    Then I validate the "bill pay blank address error message"


@bill_pay_blank_city
Scenario: Send Payment with blank city
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I click on the bill pay link
    And I fill all bill payment details except the "city" field
    And I "click" on the "send payment" "button"
    Then I validate the "bill pay blank city error message"


@bill_pay_blank_state
Scenario: Send Payment with blank state
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I click on the bill pay link
    And I fill all bill payment details except the "state" field
    And I "click" on the "send payment" "button"
    Then I validate the "bill pay blank state error message"


@bill_pay_blank_zip_code
Scenario: Send Payment with blank zip code
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I click on the bill pay link
    And I fill all bill payment details except the "zip code" field
    And I "click" on the "send payment" "button"
    Then I validate the "bill pay blank zip code error message"


@bill_pay_blank_phone_number
Scenario: Send Payment with blank phone number
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I click on the bill pay link
    And I fill all bill payment details except the "phone number" field
    And I "click" on the "send payment" "button"
    Then I validate the "bill pay blank phone number error message"


@bill_pay_blank_account_number
Scenario: Send Payment with blank account number
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I click on the bill pay link
    And I fill all bill payment details except the "account number" field
    And I "click" on the "send payment" "button"
    Then I validate the "bill pay blank account number error message"


@bill_pay_blank_verify_account_number
Scenario: Send Payment with blank verify account number
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I click on the bill pay link
    And I fill all bill payment details except the "verify account number" field
    And I "click" on the "send payment" "button"
    Then I validate the "bill pay blank verify account number error message"


@bill_pay_blank_amount
Scenario: Send Payment with blank amount
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I click on the bill pay link
    And I fill all bill payment details except the "amount" field
    And I "click" on the "send payment" "button"
    Then I validate the "bill pay blank amount error message"


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