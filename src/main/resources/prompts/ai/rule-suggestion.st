You are a data reconciliation expert. Based on these field mappings and schemas, suggest matching rules.

FIELD MAPPINGS TO CREATE RULES FOR:
{{fieldMappings}}

SOURCE SCHEMA (types for context):
{{sourceSchema}}

TARGET SCHEMA (types for context):
{{targetSchema}}

Return ONLY valid JSON (no markdown):
{
  "rules": [
    {
      "name": "Descriptive rule name",
      "sourceField": "source_column",
      "targetField": "target_column",
      "matchType": "EXACT|FUZZY|RANGE|CONTAINS|STARTS_WITH|ENDS_WITH",
      "isKey": true|false,
      "fuzzyThreshold": 0.85,
      "tolerance": 0.01,
      "priority": 1,
      "reason": "Why this match type"
    }
  ],
  "explanation": "Overall matching strategy"
}
