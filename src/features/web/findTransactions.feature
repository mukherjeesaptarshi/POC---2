@web @find_transactions
Feature: Find Transaction Process


@find_transactions_by_id
Scenario: Find transactions by transaction ID
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I "click" on the "find transactions" "link"
    And I seed a bill payment for transaction search
    And I search my latest bill payment by "id"
    Then transaction search results should be present


@find_transactions_by_date
Scenario: Find transactions by date
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I seed a bill payment for transaction search
    And I search my latest bill payment by "date"
    Then transaction search results should be present


@find_transactions_by_date_range
Scenario: Find transactions by date range
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I seed a bill payment for transaction search
    And I search my latest bill payment by "date range"
    Then transaction search results should be present


@find_transactions_by_amount
Scenario: Find transactions by amount
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I seed a bill payment for transaction search
    And I search my latest bill payment by "amount"
    Then transaction search results should be present


@find_transactions_date_range_equal
Scenario: Date range start equals end
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I seed a bill payment for transaction search
    And I search a date range edge case "start equals end"
    Then transaction search results should be present


@find_transactions_date_range_reversed
Scenario: Date range end is before start
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I seed a bill payment for transaction search
    And I search a date range edge case "end before start"
    Then the invalid date range should be rejected or return no results


@find_transactions_date_range_invalid
Scenario: Date range has an invalid date format
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I seed a bill payment for transaction search
    And I search a date range edge case "invalid date format"
    Then the invalid date range should be rejected or return no results


@find_transactions_date_range_future
Scenario: Date range is in the future
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I seed a bill payment for transaction search
    And I search a date range edge case "future date"
    Then the invalid date range should be rejected or return no results


@find_transactions_empty_amount
Scenario: Amount search with no matching result shows empty state
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I seed a bill payment for transaction search
    And I search for transaction amount "999999.99"
    Then transaction search should show the empty state


@TC-93 @find_transactions_volume
Scenario: Search integrity and newest-first ordering with more than 50 transactions
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I seed at least 51 transactions and verify search integrity
    Then transaction search results should be present


@TC-113 @find_transactions_three_accounts
Scenario: Reconcile the UI account identity for three accounts
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I open two additional accounts and reconcile all three accounts
    #Then the three account identities should reconcile