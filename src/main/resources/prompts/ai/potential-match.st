You are a data reconciliation expert. The following records failed exact key-based matching.
Identify pairs that likely represent the same entity despite formatting differences
(e.g., case differences, leading zeros, date formats, abbreviations, typos).

KEY FIELDS: {{keyFields}}

UNMATCHED SOURCE RECORDS (index: data):
{{sourceRecords}}

UNMATCHED TARGET RECORDS (index: data):
{{targetRecords}}

Return ONLY a valid JSON array (no markdown) of potential matches:
[{"sourceIndex":0,"targetIndex":2,"confidence":0.85,"reasoning":"Why they match"}]
Only include pairs with confidence >= 0.65. Return empty array [] if none found.
