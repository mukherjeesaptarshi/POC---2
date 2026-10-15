@web @session_navigation
Feature: Session security and navigation

  @TC-97
  Scenario: Expired idle session returns to login
    Given I open the signed-in web application
    When I simulate an idle session expiration
    Then the web application should show the login page

  @TC-98
  Scenario: Multiple logout clicks do not cause an application error
    Given I open the signed-in web application
    When I click log out multiple times
    Then repeated logout should not show an application error

  @TC-99
  Scenario: Refresh after logout keeps the user logged out
    Given I open the signed-in web application
    When I refresh the page after logging out
    Then the web application should show the login page

  @TC-100
  Scenario: Transfer Funds URL is protected when unauthenticated
    Given I open the web login page
    When I open the protected "transfer.htm" URL without signing in
    Then the web application should show the login page

  @TC-101
  Scenario: Loan URL is protected when unauthenticated
    Given I open the web login page
    When I open the protected "requestloan.htm" URL without signing in
    Then the web application should show the login page

  @TC-102
  Scenario: Account Services navigation links are available
    Given I open the signed-in web application
    When I verify the Account Services navigation links

  @TC-103
  Scenario: Home link returns to the landing page
    Given I open the signed-in web application
    When I navigate home using the Home link
    Then the ParaBank landing page should be displayed

  @TC-104
  Scenario: Site map internal links respond
    Given I open the web registration page
    When I open the site map
    Then all internal site map links should respond successfully

  @TC-105
  Scenario: Browser back and forward navigate correctly
    Given I open the web registration page
    When I open the site map
    And I navigate to Customer Care from the site map and use browser history
    Then the Customer Care page should be displayed

  @TC-111
  Scenario: Concurrent login in two browser contexts
    Given I open the signed-in web application
    When I sign in to the same customer in a second browser context