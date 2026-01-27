package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.dto.request.DataSourceRequest;
import com.amit.smartreconciliation.dto.response.DataSourceResponse;
import com.amit.smartreconciliation.entity.DataSource;
import com.amit.smartreconciliation.entity.Organization;
import com.amit.smartreconciliation.enums.DataSourceType;
import com.amit.smartreconciliation.exception.ResourceNotFoundException;
import com.amit.smartreconciliation.repository.DataSourceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DataSourceService {

    private static final Logger log = LoggerFactory.getLogger(DataSourceService.class);

    private final DataSourceRepository dataSourceRepository;
    private final OrganizationService organizationService;

    public DataSourceService(DataSourceRepository dataSourceRepository, OrganizationService organizationService) {
        this.dataSourceRepository = dataSourceRepository;
        this.organizationService = organizationService;
    }

    @Transactional
    public DataSourceResponse create(DataSourceRequest request) {
        Organization org = organizationService.getDefaultOrganization();

        DataSource dataSource = DataSource.builder()
                .name(request.getName())
                .description(request.getDescription())
                .type(request.getType())
                .config(request.getConfig())
                .organization(org)
                .active(true)
                .build();

        DataSource saved = dataSourceRepository.save(dataSource);
        log.info("Created data source: {} (type: {})", saved.getName(), saved.getType());
        return DataSourceResponse.fromEntity(saved);
    }

    public DataSourceResponse getById(Long id) {
        DataSource dataSource = dataSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DataSource", id));
        return DataSourceResponse.fromEntity(dataSource);
    }

    public DataSource getEntityById(Long id) {
        return dataSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DataSource", id));
    }

    public List<DataSourceResponse> getAll() {
        Organization org = organizationService.getDefaultOrganization();
        return dataSourceRepository.findByOrganizationId(org.getId())
                .stream()
                .map(DataSourceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<DataSourceResponse> getByType(DataSourceType type) {
        Organization org = organizationService.getDefaultOrganization();
        return dataSourceRepository.findByOrganizationIdAndType(org.getId(), type)
                .stream()
                .map(DataSourceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public DataSourceResponse update(Long id, DataSourceRequest request) {
        DataSource dataSource = dataSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DataSource", id));

        dataSource.setName(request.getName());
        dataSource.setDescription(request.getDescription());
        dataSource.setType(request.getType());
        dataSource.setConfig(request.getConfig());

        DataSource saved = dataSourceRepository.save(dataSource);
        log.info("Updated data source: {}", saved.getId());
        return DataSourceResponse.fromEntity(saved);
    }

    @Transactional
    public void delete(Long id) {
        DataSource dataSource = dataSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DataSource", id));
        dataSourceRepository.delete(dataSource);
        log.info("Deleted data source: {}", id);
    }

    @Transactional
    public DataSourceResponse testConnection(Long id) {
        DataSource dataSource = dataSourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DataSource", id));

        try {
            boolean success = performConnectionTest(dataSource);
            dataSource.setLastTestedAt(LocalDateTime.now());
            dataSource.setLastTestSuccessful(success);
            dataSource.setLastTestError(success ? null : "Connection test failed");
        } catch (Exception e) {
            dataSource.setLastTestedAt(LocalDateTime.now());
            dataSource.setLastTestSuccessful(false);
            dataSource.setLastTestError(e.getMessage());
            log.error("Connection test failed for data source {}: {}", id, e.getMessage());
        }

        DataSource saved = dataSourceRepository.save(dataSource);
        return DataSourceResponse.fromEntity(saved);
    }

    private boolean performConnectionTest(DataSource dataSource) {
        switch (dataSource.getType()) {
            case FILE:
                return true;
            case DATABASE:
                // TODO: Implement database connection test
                return true;
            case API:
                // TODO: Implement API connection test
                return true;
            default:
                return false;
        }
    }
}
