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

  @registration_blank_first_name
  Scenario: Register is rejected when first name is blank
    Given I open the web registration page
    When I register leaving the "first name" field blank
    Then I validate the blank "first name" field error message

  @registration_blank_last_name
  Scenario: Register is rejected when last name is blank
    Given I open the web registration page
    When I register leaving the "last name" field blank
    Then I validate the blank "last name" field error message

  @registration_blank_address
  Scenario: Register is rejected when address is blank
    Given I open the web registration page
    When I register leaving the "address" field blank
    Then I validate the blank "address" field error message

  @registration_blank_city
  Scenario: Register is rejected when city is blank
    Given I open the web registration page
    When I register leaving the "city" field blank
    Then I validate the blank "city" field error message

  @registration_blank_state
  Scenario: Register is rejected when state is blank
    Given I open the web registration page
    When I register leaving the "state" field blank
    Then I validate the blank "state" field error message

  @registration_blank_zip_code
  Scenario: Register is rejected when zip code is blank
    Given I open the web registration page
    When I register leaving the "zip code" field blank
    Then I validate the blank "zip code" field error message

  @registration_blank_phone_number
  Scenario: Register is rejected when phone number is blank
    Given I open the web registration page
    When I register leaving the "phone number" field blank
    #Then I validate the blank "phone number" field error message
    Then I validate the "registration message"

  @registration_blank_ssn
  Scenario: Register is rejected when SSN is blank
    Given I open the web registration page
    When I register leaving the "ssn" field blank
    Then I validate the blank "ssn" field error message

  @registration_blank_username
  Scenario: Register is rejected when username is blank
    Given I open the web registration page
    When I register leaving the "username" field blank
    Then I validate the blank "username" field error message

  @registration_blank_password
  Scenario: Register is rejected when password is blank
    Given I open the web registration page
    When I register leaving the "password" field blank
    Then I validate the blank "password" field error message