package com.amit.smartreconciliation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchemaResponse {
    private Long fileId;
    private String filename;
    private List<ColumnSchema> columns;
    private Integer totalRows;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ColumnSchema {
        private String name;
        private String detectedType;
        private Integer nullCount;
        private Integer uniqueCount;
        private List<String> sampleValues;
    }
}
