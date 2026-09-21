@web @registration
Feature: Web customer registration

  Scenario: A valid registration auto-logs in and loads Accounts Overview
    Given I open the web registration page
    When I register a new web customer
    Then the web Accounts Overview should show a default account with a non-null balance