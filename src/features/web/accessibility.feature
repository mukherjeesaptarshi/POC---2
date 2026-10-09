@web @accessibility
Feature: Web accessibility audits
  Scenario Outline: Audit the <page> page for WCAG A and AA violations
    Given I open the "<path>" page for accessibility review
    When I run an accessibility audit
    Then accessibility violation artifacts should be generated

    Examples:
      | page              | path        |
      | login             | index.htm   |
      | registration      | register.htm|
      | customer lookup   | lookup.htm  |