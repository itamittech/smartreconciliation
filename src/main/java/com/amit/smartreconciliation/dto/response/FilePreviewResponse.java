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
public class FilePreviewResponse {
    private Long fileId;
    private String filename;
    private List<String> headers;
    private List<List<Object>> rows;
    private Integer totalRows;
    private Integer previewRows;
}
