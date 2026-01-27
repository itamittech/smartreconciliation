package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.dto.response.SchemaResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.regex.Pattern;

@Service
@Slf4j
public class SchemaDetectionService {

    private static final Pattern NUMBER_PATTERN = Pattern.compile("^-?\\d+(\\.\\d+)?$");
    private static final Pattern INTEGER_PATTERN = Pattern.compile("^-?\\d+$");
    private static final Pattern CURRENCY_PATTERN = Pattern.compile("^[$€£¥]?-?\\d{1,3}(,\\d{3})*(\\.\\d{2})?$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    private static final Pattern PERCENTAGE_PATTERN = Pattern.compile("^-?\\d+(\\.\\d+)?%$");

    private static final List<DateTimeFormatter> DATE_FORMATTERS = Arrays.asList(
            DateTimeFormatter.ISO_LOCAL_DATE,
            DateTimeFormatter.ISO_LOCAL_DATE_TIME,
            DateTimeFormatter.ofPattern("MM/dd/yyyy"),
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("yyyy/MM/dd"),
            DateTimeFormatter.ofPattern("MM-dd-yyyy"),
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),
            DateTimeFormatter.ofPattern("MMM dd, yyyy"),
            DateTimeFormatter.ofPattern("dd MMM yyyy")
    );

    public SchemaResponse detectSchema(List<String> headers, List<List<Object>> rows, Long fileId, String filename) {
        List<SchemaResponse.ColumnSchema> columns = new ArrayList<>();

        for (int i = 0; i < headers.size(); i++) {
            String header = headers.get(i);
            List<Object> columnValues = extractColumnValues(rows, i);
            SchemaResponse.ColumnSchema columnSchema = analyzeColumn(header, columnValues);
            columns.add(columnSchema);
        }

        return SchemaResponse.builder()
                .fileId(fileId)
                .filename(filename)
                .columns(columns)
                .totalRows(rows.size())
                .build();
    }

    public List<Map<String, Object>> detectSchemaAsMap(List<String> headers, List<List<Object>> rows) {
        List<Map<String, Object>> schema = new ArrayList<>();

        for (int i = 0; i < headers.size(); i++) {
            String header = headers.get(i);
            List<Object> columnValues = extractColumnValues(rows, i);
            SchemaResponse.ColumnSchema columnSchema = analyzeColumn(header, columnValues);

            Map<String, Object> columnMap = new HashMap<>();
            columnMap.put("name", columnSchema.getName());
            columnMap.put("detectedType", columnSchema.getDetectedType());
            columnMap.put("nullCount", columnSchema.getNullCount());
            columnMap.put("uniqueCount", columnSchema.getUniqueCount());
            columnMap.put("sampleValues", columnSchema.getSampleValues());
            schema.add(columnMap);
        }

        return schema;
    }

    private List<Object> extractColumnValues(List<List<Object>> rows, int columnIndex) {
        List<Object> values = new ArrayList<>();
        for (List<Object> row : rows) {
            if (columnIndex < row.size()) {
                values.add(row.get(columnIndex));
            }
        }
        return values;
    }

    private SchemaResponse.ColumnSchema analyzeColumn(String header, List<Object> values) {
        int nullCount = 0;
        Set<Object> uniqueValues = new HashSet<>();
        List<String> sampleValues = new ArrayList<>();
        Map<String, Integer> typeCounts = new HashMap<>();

        for (Object value : values) {
            if (value == null || value.toString().trim().isEmpty()) {
                nullCount++;
                continue;
            }

            uniqueValues.add(value);

            if (sampleValues.size() < 5) {
                sampleValues.add(value.toString());
            }

            String detectedType = detectValueType(value);
            typeCounts.merge(detectedType, 1, Integer::sum);
        }

        String dominantType = typeCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("text");

        return SchemaResponse.ColumnSchema.builder()
                .name(header)
                .detectedType(dominantType)
                .nullCount(nullCount)
                .uniqueCount(uniqueValues.size())
                .sampleValues(sampleValues)
                .build();
    }

    private String detectValueType(Object value) {
        if (value == null) return "null";

        if (value instanceof Number) {
            if (value instanceof Double || value instanceof Float) {
                return "number";
            }
            return "integer";
        }

        if (value instanceof LocalDate || value instanceof LocalDateTime) {
            return "date";
        }

        if (value instanceof Boolean) {
            return "boolean";
        }

        String strValue = value.toString().trim();

        if (strValue.isEmpty()) {
            return "null";
        }

        if (CURRENCY_PATTERN.matcher(strValue).matches()) {
            return "currency";
        }

        if (PERCENTAGE_PATTERN.matcher(strValue).matches()) {
            return "percentage";
        }

        if (INTEGER_PATTERN.matcher(strValue).matches()) {
            return "integer";
        }

        if (NUMBER_PATTERN.matcher(strValue).matches()) {
            return "number";
        }

        if (isDate(strValue)) {
            return "date";
        }

        if (EMAIL_PATTERN.matcher(strValue).matches()) {
            return "email";
        }

        if (strValue.equalsIgnoreCase("true") || strValue.equalsIgnoreCase("false") ||
            strValue.equalsIgnoreCase("yes") || strValue.equalsIgnoreCase("no")) {
            return "boolean";
        }

        return "text";
    }

    private boolean isDate(String value) {
        for (DateTimeFormatter formatter : DATE_FORMATTERS) {
            try {
                LocalDate.parse(value, formatter);
                return true;
            } catch (DateTimeParseException ignored) {
            }
            try {
                LocalDateTime.parse(value, formatter);
                return true;
            } catch (DateTimeParseException ignored) {
            }
        }
        return false;
    }
}
