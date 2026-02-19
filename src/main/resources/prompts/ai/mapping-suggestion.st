You are a data reconciliation expert. Analyze these two file schemas and suggest field mappings.

SOURCE FILE: {{sourceFileName}}
Columns:
{{sourceColumns}}

TARGET FILE: {{targetFileName}}
Columns:
{{targetColumns}}

Provide field mappings as JSON array with format:
{
  "mappings": [
    {
      "sourceField": "source_column_name",
      "targetField": "target_column_name",
      "confidence": 0.95,
      "reason": "Why these fields match",
      "isKey": true/false,
      "suggestedTransform": "optional transform like UPPERCASE, DATE_FORMAT, etc."
    }
  ],
  "explanation": "Overall explanation of the mappings"
}

Only return valid JSON, no markdown code blocks or additional text.
