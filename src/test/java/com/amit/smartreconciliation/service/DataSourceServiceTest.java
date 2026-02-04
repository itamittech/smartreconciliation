package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.dto.request.DataSourceRequest;
import com.amit.smartreconciliation.dto.response.DataSourceResponse;
import com.amit.smartreconciliation.entity.DataSource;
import com.amit.smartreconciliation.entity.Organization;
import com.amit.smartreconciliation.enums.DataSourceType;
import com.amit.smartreconciliation.repository.DataSourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for DataSourceService
 * Module: Data Source Management
 * Test Level: Unit Test
 * Total Test Cases: 12
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("DataSourceService Unit Tests")
class DataSourceServiceTest {

    @Mock
    private DataSourceRepository dataSourceRepository;

    @Mock
    private OrganizationService organizationService;

    @InjectMocks
    private DataSourceService dataSourceService;

    private Organization organization;

    @BeforeEach
    void setUp() {
        organization = Organization.builder()
                .id(7L)
                .name("org-7")
                .build();
        when(organizationService.getDefaultOrganization()).thenReturn(organization);
    }

    @Test
    @DisplayName("TC-DSS-001: Create File Data Source")
    void testCreateFileDataSource() {
        // Given
        DataSourceRequest request = new DataSourceRequest();
        request.setName("File Source");
        request.setDescription("CSV uploads");
        request.setType(DataSourceType.FILE);
        request.setConfig(Map.of("path", "/uploads"));

        when(dataSourceRepository.save(any(DataSource.class))).thenAnswer(invocation -> {
            DataSource saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        // When
        DataSourceResponse response = dataSourceService.create(request);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("File Source");
        assertThat(response.getType()).isEqualTo(DataSourceType.FILE);
        assertThat(response.getActive()).isTrue();

        ArgumentCaptor<DataSource> captor = ArgumentCaptor.forClass(DataSource.class);
        verify(dataSourceRepository).save(captor.capture());
        DataSource saved = captor.getValue();
        assertThat(saved.getOrganization()).isEqualTo(organization);
        assertThat(saved.getConfig()).containsEntry("path", "/uploads");
    }

    @Test
    @DisplayName("TC-DSS-002: Create Database Data Source")
    void testCreateDatabaseDataSource() {
        // Given
        DataSourceRequest request = new DataSourceRequest();
        request.setName("DB Source");
        request.setDescription("Postgres");
        request.setType(DataSourceType.DATABASE);
        request.setConfig(Map.of("url", "jdbc:postgresql://localhost:5432/db"));

        when(dataSourceRepository.save(any(DataSource.class))).thenAnswer(invocation -> {
            DataSource saved = invocation.getArgument(0);
            saved.setId(2L);
            return saved;
        });

        // When
        DataSourceResponse response = dataSourceService.create(request);

        // Then
        assertThat(response.getId()).isEqualTo(2L);
        assertThat(response.getType()).isEqualTo(DataSourceType.DATABASE);
        assertThat(response.getConfig()).containsEntry("url", "jdbc:postgresql://localhost:5432/db");
    }

    @Test
    @DisplayName("TC-DSS-003: Create API Data Source")
    void testCreateApiDataSource() {
        // Given
        DataSourceRequest request = new DataSourceRequest();
        request.setName("API Source");
        request.setDescription("External API");
        request.setType(DataSourceType.API);
        request.setConfig(Map.of("baseUrl", "https://api.example.com"));

        when(dataSourceRepository.save(any(DataSource.class))).thenAnswer(invocation -> {
            DataSource saved = invocation.getArgument(0);
            saved.setId(3L);
            return saved;
        });

        // When
        DataSourceResponse response = dataSourceService.create(request);

        // Then
        assertThat(response.getId()).isEqualTo(3L);
        assertThat(response.getType()).isEqualTo(DataSourceType.API);
        assertThat(response.getConfig()).containsEntry("baseUrl", "https://api.example.com");
    }

    @Test
    @DisplayName("TC-DSS-004: Update Data Source")
    void testUpdateDataSource() {
        // Given
        DataSource existing = buildDataSource(10L, DataSourceType.FILE);
        when(dataSourceRepository.findById(10L)).thenReturn(Optional.of(existing));
        when(dataSourceRepository.save(any(DataSource.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DataSourceRequest request = new DataSourceRequest();
        request.setName("Updated Source");
        request.setDescription("Updated Desc");
        request.setType(DataSourceType.API);
        request.setConfig(Map.of("baseUrl", "https://updated.example.com"));

        // When
        DataSourceResponse response = dataSourceService.update(10L, request);

        // Then
        assertThat(response.getName()).isEqualTo("Updated Source");
        assertThat(response.getType()).isEqualTo(DataSourceType.API);
        assertThat(response.getConfig()).containsEntry("baseUrl", "https://updated.example.com");
    }

    @Test
    @DisplayName("TC-DSS-005: Delete Data Source")
    void testDeleteDataSource() {
        // Given
        DataSource existing = buildDataSource(11L, DataSourceType.FILE);
        when(dataSourceRepository.findById(11L)).thenReturn(Optional.of(existing));

        // When
        dataSourceService.delete(11L);

        // Then
        verify(dataSourceRepository).delete(existing);
    }

    @Test
    @DisplayName("TC-DSS-006: List Data Sources by Organization")
    void testListDataSourcesByOrganization() {
        // Given
        when(dataSourceRepository.findByOrganizationId(organization.getId()))
                .thenReturn(List.of(
                        buildDataSource(1L, DataSourceType.FILE),
                        buildDataSource(2L, DataSourceType.DATABASE)
                ));

        // When
        List<DataSourceResponse> response = dataSourceService.getAll();

        // Then
        assertThat(response).hasSize(2);
        assertThat(response).extracting(DataSourceResponse::getType)
                .containsExactly(DataSourceType.FILE, DataSourceType.DATABASE);
    }

    @Test
    @DisplayName("TC-DSS-007: Filter Data Sources by Type")
    void testFilterDataSourcesByType() {
        // Given
        when(dataSourceRepository.findByOrganizationIdAndType(organization.getId(), DataSourceType.DATABASE))
                .thenReturn(List.of(buildDataSource(5L, DataSourceType.DATABASE)));

        // When
        List<DataSourceResponse> response = dataSourceService.getByType(DataSourceType.DATABASE);

        // Then
        assertThat(response).hasSize(1);
        assertThat(response.get(0).getType()).isEqualTo(DataSourceType.DATABASE);
    }

    @Test
    @DisplayName("TC-DSS-008: Test Connection for FILE Source")
    void testConnectionFileSource() {
        // Given
        DataSource existing = buildDataSource(20L, DataSourceType.FILE);
        when(dataSourceRepository.findById(20L)).thenReturn(Optional.of(existing));
        when(dataSourceRepository.save(any(DataSource.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        DataSourceResponse response = dataSourceService.testConnection(20L);

        // Then
        assertThat(response.getLastTestSuccessful()).isTrue();
        assertThat(response.getLastTestError()).isNull();
        assertThat(response.getLastTestedAt()).isNotNull();
    }

    @Test
    @DisplayName("TC-DSS-009: Test Connection for DATABASE Source (Success)")
    void testConnectionDatabaseSuccess() {
        // Given
        DataSource existing = buildDataSource(21L, DataSourceType.DATABASE);
        when(dataSourceRepository.findById(21L)).thenReturn(Optional.of(existing));
        when(dataSourceRepository.save(any(DataSource.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        DataSourceResponse response = dataSourceService.testConnection(21L);

        // Then
        assertThat(response.getLastTestSuccessful()).isTrue();
        assertThat(response.getLastTestError()).isNull();
    }

    @Test
    @DisplayName("TC-DSS-010: Test Connection for DATABASE Source (Failure)")
    void testConnectionDatabaseFailure() {
        // Given
        DataSource existing = buildDataSource(22L, DataSourceType.DATABASE);
        existing.setConfig(Map.of("simulateFailure", true));
        when(dataSourceRepository.findById(22L)).thenReturn(Optional.of(existing));
        when(dataSourceRepository.save(any(DataSource.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        DataSourceResponse response = dataSourceService.testConnection(22L);

        // Then
        assertThat(response.getLastTestSuccessful()).isFalse();
        assertThat(response.getLastTestError()).contains("Connection test failed");
    }

    @Test
    @DisplayName("TC-DSS-011: Test Connection for API Source (Success)")
    void testConnectionApiSuccess() {
        // Given
        DataSource existing = buildDataSource(23L, DataSourceType.API);
        when(dataSourceRepository.findById(23L)).thenReturn(Optional.of(existing));
        when(dataSourceRepository.save(any(DataSource.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        DataSourceResponse response = dataSourceService.testConnection(23L);

        // Then
        assertThat(response.getLastTestSuccessful()).isTrue();
        assertThat(response.getLastTestError()).isNull();
    }

    @Test
    @DisplayName("TC-DSS-012: Test Connection for API Source (Failure)")
    void testConnectionApiFailure() {
        // Given
        DataSource existing = buildDataSource(24L, DataSourceType.API);
        existing.setConfig(Map.of("simulateFailure", true));
        when(dataSourceRepository.findById(24L)).thenReturn(Optional.of(existing));
        when(dataSourceRepository.save(any(DataSource.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        DataSourceResponse response = dataSourceService.testConnection(24L);

        // Then
        assertThat(response.getLastTestSuccessful()).isFalse();
        assertThat(response.getLastTestError()).contains("Connection test failed");
    }

    private DataSource buildDataSource(Long id, DataSourceType type) {
        DataSource dataSource = new DataSource();
        dataSource.setId(id);
        dataSource.setName("Source " + id);
        dataSource.setType(type);
        dataSource.setOrganization(organization);
        dataSource.setLastTestedAt(LocalDateTime.now());
        return dataSource;
    }
}
