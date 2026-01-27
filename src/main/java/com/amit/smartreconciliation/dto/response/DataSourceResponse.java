package com.amit.smartreconciliation.dto.response;

import com.amit.smartreconciliation.entity.DataSource;
import com.amit.smartreconciliation.enums.DataSourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DataSourceResponse {
    private Long id;
    private String name;
    private String description;
    private DataSourceType type;
    private Map<String, Object> config;
    private Boolean active;
    private LocalDateTime lastTestedAt;
    private Boolean lastTestSuccessful;
    private String lastTestError;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DataSourceResponse fromEntity(DataSource entity) {
        return DataSourceResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .type(entity.getType())
                .config(entity.getConfig())
                .active(entity.getActive())
                .lastTestedAt(entity.getLastTestedAt())
                .lastTestSuccessful(entity.getLastTestSuccessful())
                .lastTestError(entity.getLastTestError())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
