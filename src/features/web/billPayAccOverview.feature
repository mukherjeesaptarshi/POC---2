@web @bill_pay
Feature: Bill Pay Process Verification Through Account Overview


@bill_pay_success
Scenario: Send Payment with all values
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I click on the bill pay link
    And I fill all bill payment details
    And I "click" on the "send payment" "button"
    And I validate the "bill pay success message"
    And I "click" on the "accounts overview" "link"
    And I "click" on the "account number" "link"
    And I "click" on the "transaction" "link"
    Then I validate the "transaction details"