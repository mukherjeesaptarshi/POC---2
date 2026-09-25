@web @bill_pay
Feature: Bill Pay Process


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