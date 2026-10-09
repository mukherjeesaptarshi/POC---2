@web @loans
Feature: Loan application and account servicing

  @loan_approved
  Scenario: A funded customer receives an approved loan account
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I apply for a loan of "100" with down payment "20"
    Then the loan status should be "Approved"
    And the approved loan account should appear in Accounts Overview

  @loan_down_payment_exceeds_funds
  Scenario: A down payment greater than available funds is denied
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I apply for a loan of "100" with down payment "10000"
    Then the loan should be denied with the funding message

  @loan_amount_down_payment_boundaries
  Scenario Outline: Loan amount and down payment boundary is rejected
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I apply for a loan of "<amount>" with down payment "<downPayment>"
    Then the loan boundary request should be rejected

    Examples:
      | case                  | amount | downPayment |
      | zero amount           | 0      | 20          |
      | negative amount       | -10    | 20          |
      | blank down payment    | 100    |             |
      | non numeric amount    | abc    | 20          |
      | down equals loan      | 100    | 100         |

  @loan_approval_matrix
  Scenario Outline: Loan approval decision follows amount, down payment, and available balance
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I apply for a loan of "<amount>" with down payment "<downPayment>"
    Then the loan status should be "<status>"

    Examples:
      | amount | downPayment | balance condition                 | status   |
      | 100    | 20          | funded account covers deposit     | Approved |
      | 100    | 10000       | deposit exceeds available funds   | Denied   |
      | 10000  | 20          | requested amount exceeds capacity | Denied   |
      | 50     | 10          | small request with funded account| Approved |
      | 250    | 100         | moderate request with funded account | Approved |

  @loan_account_transfer
  Scenario: Approved loan account supports outward transfers
    Given I open the web registration page
    And I have registered a new web customer
    When I validate the "registration message"
    And I apply for a loan of "100" with down payment "20"
    And the loan status should be "Approved"
    And I transfer funds out of the approved loan account
    Then I validate the "transfer complete message"