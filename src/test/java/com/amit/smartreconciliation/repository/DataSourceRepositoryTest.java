package com.amit.smartreconciliation.repository;

import com.amit.smartreconciliation.entity.DataSource;
import com.amit.smartreconciliation.entity.Organization;
import com.amit.smartreconciliation.enums.DataSourceType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
@DisplayName("DataSourceRepository Tests")
class DataSourceRepositoryTest {

    @Container
    static final PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void registerDataSourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private DataSourceRepository dataSourceRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Test
    @DisplayName("TC-DSR-001: Find Data Sources by Organization")
    void testFindByOrganization() {
        // Given
        Organization org = buildOrganization("org-1");
        Organization other = buildOrganization("org-2");

        dataSourceRepository.saveAndFlush(buildDataSource("File A", DataSourceType.FILE, org));
        dataSourceRepository.saveAndFlush(buildDataSource("DB A", DataSourceType.DATABASE, org));
        dataSourceRepository.saveAndFlush(buildDataSource("API B", DataSourceType.API, other));

        // When
        var results = dataSourceRepository.findByOrganizationId(org.getId());

        // Then
        assertThat(results).hasSize(2);
        assertThat(results).allMatch(ds -> ds.getOrganization().getId().equals(org.getId()));
    }

    @Test
    @DisplayName("TC-DSR-002: Find Data Sources by Organization and Type")
    void testFindByOrganizationAndType() {
        // Given
        Organization org = buildOrganization("org-3");

        dataSourceRepository.saveAndFlush(buildDataSource("File A", DataSourceType.FILE, org));
        dataSourceRepository.saveAndFlush(buildDataSource("DB A", DataSourceType.DATABASE, org));
        dataSourceRepository.saveAndFlush(buildDataSource("DB B", DataSourceType.DATABASE, org));

        // When
        var results = dataSourceRepository.findByOrganizationIdAndType(org.getId(), DataSourceType.DATABASE);

        // Then
        assertThat(results).hasSize(2);
        assertThat(results).allMatch(ds -> ds.getType() == DataSourceType.DATABASE);
    }

    private Organization buildOrganization(String name) {
        Organization organization = Organization.builder()
                .name(name)
                .description("Test org")
                .active(true)
                .build();
        return organizationRepository.saveAndFlush(organization);
    }

    private DataSource buildDataSource(String name, DataSourceType type, Organization org) {
        DataSource dataSource = new DataSource();
        dataSource.setName(name);
        dataSource.setType(type);
        dataSource.setOrganization(org);
        dataSource.setActive(true);
        return dataSource;
    }
}
