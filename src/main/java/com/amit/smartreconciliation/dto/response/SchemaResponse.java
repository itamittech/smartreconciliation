package com.amit.smartreconciliation.dto.response;

import java.util.List;

public class SchemaResponse {
    private Long fileId;
    private String filename;
    private List<ColumnSchema> columns;
    private Integer totalRows;

    public SchemaResponse() {}

    public Long getFileId() { return fileId; }
    public void setFileId(Long fileId) { this.fileId = fileId; }
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    public List<ColumnSchema> getColumns() { return columns; }
    public void setColumns(List<ColumnSchema> columns) { this.columns = columns; }
    public Integer getTotalRows() { return totalRows; }
    public void setTotalRows(Integer totalRows) { this.totalRows = totalRows; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final SchemaResponse r = new SchemaResponse();
        public Builder fileId(Long v) { r.fileId = v; return this; }
        public Builder filename(String v) { r.filename = v; return this; }
        public Builder columns(List<ColumnSchema> v) { r.columns = v; return this; }
        public Builder totalRows(Integer v) { r.totalRows = v; return this; }
        public SchemaResponse build() { return r; }
    }

    public static class ColumnSchema {
        private String name;
        private String detectedType;
        private Integer nullCount;
        private Integer uniqueCount;
        private List<String> sampleValues;

        public ColumnSchema() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDetectedType() { return detectedType; }
        public void setDetectedType(String detectedType) { this.detectedType = detectedType; }
        public Integer getNullCount() { return nullCount; }
        public void setNullCount(Integer nullCount) { this.nullCount = nullCount; }
        public Integer getUniqueCount() { return uniqueCount; }
        public void setUniqueCount(Integer uniqueCount) { this.uniqueCount = uniqueCount; }
        public List<String> getSampleValues() { return sampleValues; }
        public void setSampleValues(List<String> sampleValues) { this.sampleValues = sampleValues; }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private final ColumnSchema c = new ColumnSchema();
            public Builder name(String v) { c.name = v; return this; }
            public Builder detectedType(String v) { c.detectedType = v; return this; }
            public Builder nullCount(Integer v) { c.nullCount = v; return this; }
            public Builder uniqueCount(Integer v) { c.uniqueCount = v; return this; }
            public Builder sampleValues(List<String> v) { c.sampleValues = v; return this; }
            public ColumnSchema build() { return c; }
        }
    }
}
