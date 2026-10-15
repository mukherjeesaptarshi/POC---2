@web @customer_care
Feature: Customer care requests

  @TC-106
  Scenario: Submit a valid customer care request
    Given I open the customer care page
    When I submit a valid customer care request
    Then the customer care request should be accepted

  @TC-107
  Scenario: Customer care requires a name
    Given I open the customer care page
    When I submit a customer care request with "name" blank
    Then the customer care form should require "name"

  @TC-108
  Scenario: Customer care requires an email
    Given I open the customer care page
    When I submit a customer care request with "email" blank
    Then the customer care form should require "email"

  @TC-109
  Scenario: Invalid customer care email is rejected
    Given I open the customer care page
    When I submit a customer care request with an invalid email
    Then the customer care form should report an invalid email

  @TC-110
  Scenario: Very large customer care message is handled gracefully
    Given I open the customer care page
    When I submit a customer care request with a very large message
    Then the large customer care request should be handled gracefully