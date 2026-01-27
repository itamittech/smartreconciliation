package com.amit.smartreconciliation.dto.response;

import java.util.List;

public class FilePreviewResponse {
    private Long fileId;
    private String filename;
    private List<String> headers;
    private List<List<Object>> rows;
    private Integer totalRows;
    private Integer previewRows;

    public FilePreviewResponse() {}

    public Long getFileId() { return fileId; }
    public void setFileId(Long fileId) { this.fileId = fileId; }
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    public List<String> getHeaders() { return headers; }
    public void setHeaders(List<String> headers) { this.headers = headers; }
    public List<List<Object>> getRows() { return rows; }
    public void setRows(List<List<Object>> rows) { this.rows = rows; }
    public Integer getTotalRows() { return totalRows; }
    public void setTotalRows(Integer totalRows) { this.totalRows = totalRows; }
    public Integer getPreviewRows() { return previewRows; }
    public void setPreviewRows(Integer previewRows) { this.previewRows = previewRows; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final FilePreviewResponse r = new FilePreviewResponse();
        public Builder fileId(Long v) { r.fileId = v; return this; }
        public Builder filename(String v) { r.filename = v; return this; }
        public Builder headers(List<String> v) { r.headers = v; return this; }
        public Builder rows(List<List<Object>> v) { r.rows = v; return this; }
        public Builder totalRows(Integer v) { r.totalRows = v; return this; }
        public Builder previewRows(Integer v) { r.previewRows = v; return this; }
        public FilePreviewResponse build() { return r; }
    }
}
