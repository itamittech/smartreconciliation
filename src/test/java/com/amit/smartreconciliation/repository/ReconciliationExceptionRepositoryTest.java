package com.amit.smartreconciliation.repository;

import com.amit.smartreconciliation.entity.Organization;
import com.amit.smartreconciliation.entity.Reconciliation;
import com.amit.smartreconciliation.entity.ReconciliationException;
import com.amit.smartreconciliation.enums.ExceptionSeverity;
import com.amit.smartreconciliation.enums.ExceptionStatus;
import com.amit.smartreconciliation.enums.ExceptionType;
import com.amit.smartreconciliation.enums.ReconciliationStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
@DisplayName("ReconciliationExceptionRepository Tests")
class ReconciliationExceptionRepositoryTest {

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
    private ReconciliationExceptionRepository exceptionRepository;

    @Autowired
    private ReconciliationRepository reconciliationRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Test
    @DisplayName("TC-RER-001: Find Exceptions by Reconciliation ID")
    void testFindExceptionsByReconciliationId() {
        // Given
        Reconciliation reconciliation = buildReconciliation("Recon-1");
        reconciliation = reconciliationRepository.saveAndFlush(reconciliation);

        exceptionRepository.saveAndFlush(buildException(reconciliation, ExceptionType.VALUE_MISMATCH,
                ExceptionSeverity.HIGH, ExceptionStatus.OPEN));
        exceptionRepository.saveAndFlush(buildException(reconciliation, ExceptionType.MISSING_TARGET,
                ExceptionSeverity.MEDIUM, ExceptionStatus.OPEN));
        exceptionRepository.saveAndFlush(buildException(reconciliation, ExceptionType.DUPLICATE,
                ExceptionSeverity.HIGH, ExceptionStatus.IN_REVIEW));

        // When
        var results = exceptionRepository.findByReconciliationId(reconciliation.getId());

        // Then
        assertThat(results).hasSize(3);
        assertThat(results).allMatch(e -> e.getReconciliation().getId().equals(reconciliation.getId()));
    }

    @Test
    @DisplayName("TC-RER-002: Custom Filter Query with Multiple Criteria")
    void testCustomFilterQueryWithMultipleCriteria() {
        // Given
        Reconciliation reconciliation = buildReconciliation("Recon-2");
        reconciliation = reconciliationRepository.saveAndFlush(reconciliation);

        exceptionRepository.saveAndFlush(buildException(reconciliation, ExceptionType.VALUE_MISMATCH,
                ExceptionSeverity.HIGH, ExceptionStatus.OPEN));
        exceptionRepository.saveAndFlush(buildException(reconciliation, ExceptionType.VALUE_MISMATCH,
                ExceptionSeverity.MEDIUM, ExceptionStatus.OPEN));
        exceptionRepository.saveAndFlush(buildException(reconciliation, ExceptionType.MISSING_SOURCE,
                ExceptionSeverity.HIGH, ExceptionStatus.OPEN));

        // When
        var page = exceptionRepository.findByFilters(
                reconciliation.getId(),
                ExceptionType.VALUE_MISMATCH,
                ExceptionSeverity.HIGH,
                ExceptionStatus.OPEN,
                PageRequest.of(0, 10));

        // Then
        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getContent().get(0).getType()).isEqualTo(ExceptionType.VALUE_MISMATCH);
        assertThat(page.getContent().get(0).getSeverity()).isEqualTo(ExceptionSeverity.HIGH);
        assertThat(page.getContent().get(0).getStatus()).isEqualTo(ExceptionStatus.OPEN);
    }

    @Test
    @DisplayName("TC-RER-003: Handle Null Filter Values")
    void testHandleNullFilterValues() {
        // Given
        Reconciliation reconciliation = buildReconciliation("Recon-3");
        reconciliation = reconciliationRepository.saveAndFlush(reconciliation);

        exceptionRepository.saveAndFlush(buildException(reconciliation, ExceptionType.MISSING_TARGET,
                ExceptionSeverity.MEDIUM, ExceptionStatus.OPEN));
        exceptionRepository.saveAndFlush(buildException(reconciliation, ExceptionType.DUPLICATE,
                ExceptionSeverity.HIGH, ExceptionStatus.ACKNOWLEDGED));

        // When
        var page = exceptionRepository.findByFilters(
                reconciliation.getId(),
                null,
                null,
                null,
                PageRequest.of(0, 10));

        // Then
        assertThat(page.getContent()).hasSize(2);
    }

    private Reconciliation buildReconciliation(String name) {
        Organization organization = Organization.builder()
                .name(name + "-org")
                .description("Test org")
                .active(true)
                .build();
        organization = organizationRepository.saveAndFlush(organization);

        Reconciliation reconciliation = new Reconciliation();
        reconciliation.setName(name);
        reconciliation.setStatus(ReconciliationStatus.COMPLETED);
        reconciliation.setOrganization(organization);
        return reconciliation;
    }

    private ReconciliationException buildException(Reconciliation reconciliation,
                                                   ExceptionType type,
                                                   ExceptionSeverity severity,
                                                   ExceptionStatus status) {
        ReconciliationException exception = new ReconciliationException();
        exception.setReconciliation(reconciliation);
        exception.setType(type);
        exception.setSeverity(severity);
        exception.setStatus(status);
        exception.setFieldName("amount");
        exception.setSourceValue("100.00");
        exception.setTargetValue("150.00");
        exception.setDescription("Value mismatch");
        return exception;
    }
}
