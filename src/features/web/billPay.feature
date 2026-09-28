@web @bill_pay
Feature: Bill Pay Process


@bill_pay_repeat_same_biller
Scenario: Pay the same biller twice in one session
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I "click" on the "bill pay" "link"
    And I pay the same bill twice in this session
    Then I validate two distinct bill payment debit entries


@bill_pay_batch_csv
Scenario: Pay 10 different billers from CSV and reconcile account activity
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I "click" on the "bill pay" "link"
    And I pay all billers from the "data/billers.csv" CSV file
    Then I reconcile the bill payment debits against account activity from the "data/billers.csv" CSV file


@bill_pay_success
Scenario: Send Payment with all values
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I "click" on the "bill pay" "link"
    And I fill all bill payment details
    And I "click" on the "send payment" "button"
    Then I validate the "bill pay success message"


@bill_pay_blank_payee_name
Scenario: Send Payment with blank payee name
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I "click" on the "bill pay" "link"
    And I fill all bill payment details except the "payee name" field
    And I "click" on the "send payment" "button"
    Then I validate the "bill pay blank payee name error message"


@bill_pay_blank_address
Scenario: Send Payment with blank address
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I "click" on the "bill pay" "link"
    And I fill all bill payment details except the "address" field
    And I "click" on the "send payment" "button"
    Then I validate the "bill pay blank address error message"


@bill_pay_blank_city
Scenario: Send Payment with blank city
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I "click" on the "bill pay" "link"
    And I fill all bill payment details except the "city" field
    And I "click" on the "send payment" "button"
    Then I validate the "bill pay blank city error message"


@bill_pay_blank_state
Scenario: Send Payment with blank state
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I "click" on the "bill pay" "link"
    And I fill all bill payment details except the "state" field
    And I "click" on the "send payment" "button"
    Then I validate the "bill pay blank state error message"


@bill_pay_blank_zip_code
Scenario: Send Payment with blank zip code
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I "click" on the "bill pay" "link"
    And I fill all bill payment details except the "zip code" field
    And I "click" on the "send payment" "button"
    Then I validate the "bill pay blank zip code error message"


@bill_pay_blank_phone_number
Scenario: Send Payment with blank phone number
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I "click" on the "bill pay" "link"
    And I fill all bill payment details except the "phone number" field
    And I "click" on the "send payment" "button"
    Then I validate the "bill pay blank phone number error message"


@bill_pay_blank_account_number
Scenario: Send Payment with blank account number
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I "click" on the "bill pay" "link"
    And I fill all bill payment details except the "account number" field
    And I "click" on the "send payment" "button"
    Then I validate the "bill pay blank account number error message"


@bill_pay_blank_verify_account_number
Scenario: Send Payment with blank verify account number
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I "click" on the "bill pay" "link"
    And I fill all bill payment details except the "verify account number" field
    And I "click" on the "send payment" "button"
    Then I validate the "bill pay blank verify account number error message"


@bill_pay_blank_amount
Scenario: Send Payment with blank amount
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I "click" on the "bill pay" "link"
    And I fill all bill payment details except the "amount" field
    And I "click" on the "send payment" "button"
    Then I validate the "bill pay blank amount error message"


@bill_pay_mismatch_acc_number
Scenario: Verify Account Mismatch
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I "click" on the "bill pay" "link"
    And I fill all bill payment details except the "verify account number" field
    And I enter "6290" in the "verify account number" textbox
    And I "click" on the "send payment" "button"
    Then I validate the "account numbers do not match error message"


@bill_pay_amount_bva
Scenario Outline: Boundary Value Analysis for Amount
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I "click" on the "bill pay" "link"
    And I fill all bill payment details except the "amount" field
    And I enter "<amount>" in the "amount" textbox
    And I "click" on the "send payment" "button"
    And I validate the "bill pay success message"
    And I "click" on the "accounts overview" "link"
    And I "click" on the "account number" "link"
    And I "click" on the "transaction" "link"
    Then I validate the "transaction details"

    Examples:
    | variant              | amount  |
    | zero amount          | 0       |


@bill_pay_negative_amount
Scenario: Bill payment with a negative amount is rejected
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I "click" on the "bill pay" "link"
    And I fill all bill payment details except the "amount" field
    And I enter "-10" in the "amount" textbox
    And I "click" on the "send payment" "button"
    Then I validate the "bill pay amount error message"


@bill_pay_amount_precision
Scenario: Bill payment amount with more than two decimals is rejected
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I "click" on the "bill pay" "link"
    And I fill all bill payment details except the "amount" field
    And I enter "1.001" in the "amount" textbox
    And I "click" on the "send payment" "button"
    Then I validate the "bill pay amount error message"


@bill_pay_exceeding_balance
Scenario: Bill payment exceeding balance is rejected
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I "click" on the "bill pay" "link"
    And I fill all bill payment details except the "amount" field
    And I enter "600.00" in the "amount" textbox
    And I "click" on the "send payment" "button"
    Then I validate the "bill pay amount error message"


@bill_pay_amount_string_value
Scenario: Entering String In Amount
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I "click" on the "bill pay" "link"
    And I fill all bill payment details except the "amount" field
    And I enter "abcd" in the "amount" textbox
    And I "click" on the "send payment" "button"
    Then I validate the "valid amount error message"