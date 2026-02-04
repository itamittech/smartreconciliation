package com.amit.smartreconciliation.repository;

import com.amit.smartreconciliation.entity.Organization;
import com.amit.smartreconciliation.entity.Reconciliation;
import com.amit.smartreconciliation.enums.ReconciliationStatus;
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

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
@DisplayName("ReconciliationRepository Tests")
class ReconciliationRepositoryTest {

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
    private ReconciliationRepository reconciliationRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Test
    @DisplayName("TC-RR-001: Save and Retrieve Reconciliation Entity")
    void testTcRr001_saveAndRetrieveReconciliationEntity() {
        // Given
        Organization organization = Organization.builder()
                .name("org-123")
                .description("Test org")
                .active(true)
                .build();
        organization = organizationRepository.saveAndFlush(organization);

        Reconciliation reconciliation = new Reconciliation();
        reconciliation.setName("Q1 2024 Reconciliation");
        reconciliation.setStatus(ReconciliationStatus.COMPLETED);
        reconciliation.setMatchRate(95.5);
        reconciliation.setTotalSourceRecords(1000);
        reconciliation.setTotalTargetRecords(980);
        reconciliation.setMatchedRecords(955);
        reconciliation.setUnmatchedSourceRecords(45);
        reconciliation.setOrganization(organization);
        reconciliation.setCompletedAt(LocalDateTime.of(2024, 1, 15, 10, 35));

        // When
        Reconciliation saved = reconciliationRepository.saveAndFlush(reconciliation);
        Reconciliation found = reconciliationRepository.findById(saved.getId()).orElseThrow();

        // Then
        assertThat(found.getName()).isEqualTo("Q1 2024 Reconciliation");
        assertThat(found.getStatus()).isEqualTo(ReconciliationStatus.COMPLETED);
        assertThat(found.getMatchRate()).isEqualTo(95.5);
        assertThat(found.getTotalSourceRecords()).isEqualTo(1000);
        assertThat(found.getTotalTargetRecords()).isEqualTo(980);
        assertThat(found.getMatchedRecords()).isEqualTo(955);
        assertThat(found.getUnmatchedSourceRecords()).isEqualTo(45);
        assertThat(found.getOrganization().getId()).isEqualTo(organization.getId());
        assertThat(found.getCreatedAt()).isNotNull();
        assertThat(found.getCompletedAt()).isNotNull();
    }

    @Test
    @DisplayName("TC-RR-002: Find Reconciliations by Organization")
    void testTcRr002_findReconciliationsByOrganization() {
        // Given
        Organization org123 = Organization.builder()
                .name("org-123")
                .description("Org 123")
                .active(true)
                .build();
        Organization org456 = Organization.builder()
                .name("org-456")
                .description("Org 456")
                .active(true)
                .build();
        Organization org123Saved = organizationRepository.saveAndFlush(org123);
        Organization org456Saved = organizationRepository.saveAndFlush(org456);

        reconciliationRepository.saveAndFlush(buildReconciliation("Recon-1", org123Saved));
        reconciliationRepository.saveAndFlush(buildReconciliation("Recon-2", org123Saved));
        reconciliationRepository.saveAndFlush(buildReconciliation("Recon-3", org123Saved));
        reconciliationRepository.saveAndFlush(buildReconciliation("Recon-4", org456Saved));
        reconciliationRepository.saveAndFlush(buildReconciliation("Recon-5", org456Saved));

        // When
        var results = reconciliationRepository.findByOrganizationId(org123Saved.getId());

        // Then
        assertThat(results).hasSize(3);
        assertThat(results).allMatch(r -> r.getOrganization().getId().equals(org123Saved.getId()));
    }

    @Test
    @DisplayName("TC-RR-003: Update Reconciliation Status")
    void testTcRr003_updateReconciliationStatus() {
        // Given
        Organization organization = Organization.builder()
                .name("org-789")
                .description("Org 789")
                .active(true)
                .build();
        organization = organizationRepository.saveAndFlush(organization);

        Reconciliation reconciliation = new Reconciliation();
        reconciliation.setName("Status Update Recon");
        reconciliation.setStatus(ReconciliationStatus.PENDING);
        reconciliation.setOrganization(organization);
        reconciliation = reconciliationRepository.saveAndFlush(reconciliation);

        // When
        reconciliation.setStatus(ReconciliationStatus.IN_PROGRESS);
        reconciliationRepository.saveAndFlush(reconciliation);

        Reconciliation found = reconciliationRepository.findById(reconciliation.getId()).orElseThrow();

        // Then
        assertThat(found.getStatus()).isEqualTo(ReconciliationStatus.IN_PROGRESS);
    }

    private Reconciliation buildReconciliation(String name, Organization organization) {
        Reconciliation reconciliation = new Reconciliation();
        reconciliation.setName(name);
        reconciliation.setStatus(ReconciliationStatus.PENDING);
        reconciliation.setOrganization(organization);
        return reconciliation;
    }
}
