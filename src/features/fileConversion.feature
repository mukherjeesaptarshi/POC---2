@api @files
Feature: File conversion utility

  Scenario: Convert text content into a JSON file and return the JSON payload
    Given I convert the following text to JSON with file name "sample" and output directory "locales"
      """
      name=Alice
      email=alice@example.com
      status=active
      """
    When the conversion response status should be 200
    And the conversion response should include file name "sample.json"
    And the conversion response should include "name" with value "Alice"
    Then the generated JSON file should exist in the local output folder
