@web @registration
Feature: Web customer registration


  @successful_registration
  Scenario: A valid registration auto-logs in and loads Accounts Overview
    Given I open the web registration page
    When I click on the Register link
    And I enter all the required details
    And I "click" on the "register" "button"
    And I validate the "registration message"
    Then I "click" on the "logout" "button"


  @blank_registration
  Scenario: Registering without enetering any values in fields
    Given I open the web registration page
    When I click on the Register link
    And I "click" on the "register" "button"
    Then I validate the "error message"