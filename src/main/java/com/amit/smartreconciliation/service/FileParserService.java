package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.exception.FileProcessingException;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.*;

@Service
public class FileParserService {

    private static final Logger log = LoggerFactory.getLogger(FileParserService.class);

    public ParseResult parseFile(MultipartFile file) {
        String filename = file.getOriginalFilename();
        String contentType = file.getContentType();

        try {
            if (isCSV(filename, contentType)) {
                return parseCSV(file.getInputStream());
            } else if (isExcel(filename, contentType)) {
                return parseExcel(file.getInputStream());
            } else if (isJSON(filename, contentType)) {
                return parseJSON(file.getInputStream());
            } else {
                throw new FileProcessingException("Unsupported file type: " + contentType);
            }
        } catch (IOException e) {
            throw new FileProcessingException("Error parsing file: " + e.getMessage(), e);
        }
    }

    public ParseResult parseFile(Path filePath) {
        String filename = filePath.getFileName().toString();

        try (InputStream is = new FileInputStream(filePath.toFile())) {
            if (filename.endsWith(".csv")) {
                return parseCSV(is);
            } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
                return parseExcel(is);
            } else if (filename.endsWith(".json")) {
                return parseJSON(is);
            } else {
                throw new FileProcessingException("Unsupported file type: " + filename);
            }
        } catch (IOException e) {
            throw new FileProcessingException("Error parsing file: " + e.getMessage(), e);
        }
    }

    private ParseResult parseCSV(InputStream inputStream) throws IOException {
        List<String> headers = new ArrayList<>();
        List<List<Object>> rows = new ArrayList<>();

        try (Reader reader = new InputStreamReader(inputStream, StandardCharsets.UTF_8);
             CSVParser parser = CSVFormat.DEFAULT.builder()
                     .setHeader()
                     .setSkipHeaderRecord(true)
                     .setIgnoreEmptyLines(true)
                     .setTrim(true)
                     .build()
                     .parse(reader)) {

            headers.addAll(parser.getHeaderNames());

            for (CSVRecord record : parser) {
                List<Object> row = new ArrayList<>();
                for (String header : headers) {
                    row.add(record.get(header));
                }
                rows.add(row);
            }
        }

        return new ParseResult(headers, rows);
    }

    private ParseResult parseExcel(InputStream inputStream) throws IOException {
        List<String> headers = new ArrayList<>();
        List<List<Object>> rows = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();

            if (rowIterator.hasNext()) {
                Row headerRow = rowIterator.next();
                for (Cell cell : headerRow) {
                    headers.add(getCellValueAsString(cell));
                }
            }

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                List<Object> rowData = new ArrayList<>();
                for (int i = 0; i < headers.size(); i++) {
                    Cell cell = row.getCell(i);
                    rowData.add(getCellValue(cell));
                }
                rows.add(rowData);
            }
        }

        return new ParseResult(headers, rows);
    }

    private ParseResult parseJSON(InputStream inputStream) throws IOException {
        throw new FileProcessingException("JSON parsing not yet implemented");
    }

    private boolean isCSV(String filename, String contentType) {
        return (filename != null && filename.toLowerCase().endsWith(".csv")) ||
               "text/csv".equals(contentType) ||
               "application/csv".equals(contentType);
    }

    private boolean isExcel(String filename, String contentType) {
        return (filename != null && (filename.toLowerCase().endsWith(".xlsx") || filename.toLowerCase().endsWith(".xls"))) ||
               "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet".equals(contentType) ||
               "application/vnd.ms-excel".equals(contentType);
    }

    private boolean isJSON(String filename, String contentType) {
        return (filename != null && filename.toLowerCase().endsWith(".json")) ||
               "application/json".equals(contentType);
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getCellFormula();
            default -> "";
        };
    }

    private Object getCellValue(Cell cell) {
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield cell.getLocalDateTimeCellValue();
                }
                yield cell.getNumericCellValue();
            }
            case BOOLEAN -> cell.getBooleanCellValue();
            case FORMULA -> cell.getCellFormula();
            default -> null;
        };
    }

    public record ParseResult(List<String> headers, List<List<Object>> rows) {
        public int getRowCount() {
            return rows.size();
        }

        public int getColumnCount() {
            return headers.size();
        }
    }
}
