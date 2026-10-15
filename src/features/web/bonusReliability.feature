@web @bonus_reliability
Feature: High-value reliability scenarios

  @TC-112
  Scenario: Duplicate transfer submission is prevented
    Given I open the signed-in web application
    And I prepare two accounts and open Transfer Funds
    When I double-submit a transfer of "1.00" to the second account
    Then the transfer should be applied only once

  @TC-114
  Scenario: Refresh during transfer processing does not duplicate the transfer
    Given I open the signed-in web application
    And I prepare two accounts and open Transfer Funds
    When I submit a "1.00" transfer and refresh during processing
    Then the refreshed transfer should not be applied more than once

  @TC-115
  Scenario: Refresh during bill-payment processing does not duplicate the payment
    Given I open the signed-in web application
    When I submit a bill payment and refresh during processing
    Then the refreshed bill payment should not be duplicated