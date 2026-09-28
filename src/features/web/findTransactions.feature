@web @find_transactions
Feature: Find Transaction Process


@find_transactions_by_values
Scenario: Find Transactions By Different Values
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I "click" on the "find transactions" "link"