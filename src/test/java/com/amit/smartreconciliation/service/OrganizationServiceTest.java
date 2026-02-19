package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.entity.Organization;
import com.amit.smartreconciliation.exception.ResourceNotFoundException;
import com.amit.smartreconciliation.repository.OrganizationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for OrganizationService
 * Module: Cross-Cutting Concerns
 * Test Level: Unit Test
 * Total Test Cases: 3
 *
 * Tests the core multi-tenancy foundation layer that scopes all
 * other entities (DataSources, Files, Reconciliations, etc.) to an Organization.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("OrganizationService Unit Tests")
class OrganizationServiceTest {

    @Mock
    private OrganizationRepository organizationRepository;

    @InjectMocks
    private OrganizationService organizationService;

    private Organization testOrganization;

    @BeforeEach
    void setUp() {
        testOrganization = Organization.builder()
                .id(1L)
                .name("Test Organization")
                .description("Test org for unit tests")
                .active(true)
                .build();
    }

    @Test
    @DisplayName("TC-ORG-001: Create default organization on initialization")
    void testInitDefaultOrganization_createsWhenNotExists() {
        // Given
        when(organizationRepository.existsByName("Default Organization")).thenReturn(false);
        when(organizationRepository.save(any(Organization.class))).thenAnswer(invocation -> {
            Organization saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        // When
        organizationService.initDefaultOrganization();

        // Then
        ArgumentCaptor<Organization> orgCaptor = ArgumentCaptor.forClass(Organization.class);
        verify(organizationRepository).save(orgCaptor.capture());

        Organization savedOrg = orgCaptor.getValue();
        assertThat(savedOrg.getName()).isEqualTo("Default Organization");
        assertThat(savedOrg.getDescription()).isEqualTo("Default organization for the MVP");
        assertThat(savedOrg.getActive()).isTrue();
    }

    @Test
    @DisplayName("TC-ORG-001: Skip creation when default organization exists")
    void testInitDefaultOrganization_skipsWhenExists() {
        // Given
        when(organizationRepository.existsByName("Default Organization")).thenReturn(true);

        // When
        organizationService.initDefaultOrganization();

        // Then
        verify(organizationRepository, never()).save(any(Organization.class));
    }

    @Test
    @DisplayName("TC-ORG-002: Get organization by ID - success")
    void testGetById_success() {
        // Given
        Long organizationId = 1L;
        when(organizationRepository.findById(organizationId)).thenReturn(Optional.of(testOrganization));

        // When
        Organization result = organizationService.getById(organizationId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(organizationId);
        assertThat(result.getName()).isEqualTo("Test Organization");
        assertThat(result.getDescription()).isEqualTo("Test org for unit tests");
        assertThat(result.getActive()).isTrue();
        verify(organizationRepository).findById(organizationId);
    }

    @Test
    @DisplayName("TC-ORG-002: Get organization by ID - throws exception when not found")
    void testGetById_throwsExceptionWhenNotFound() {
        // Given
        Long nonExistentId = 999L;
        when(organizationRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> organizationService.getById(nonExistentId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Organization")
                .hasMessageContaining("999");

        verify(organizationRepository).findById(nonExistentId);
    }

    @Test
    @DisplayName("TC-ORG-003: Get default organization - success")
    void testGetDefaultOrganization_success() {
        // Given
        Organization defaultOrg = Organization.builder()
                .id(1L)
                .name("Default Organization")
                .description("Default organization for the MVP")
                .active(true)
                .build();
        when(organizationRepository.findByName("Default Organization")).thenReturn(Optional.of(defaultOrg));

        // When
        Organization result = organizationService.getDefaultOrganization();

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Default Organization");
        assertThat(result.getDescription()).isEqualTo("Default organization for the MVP");
        assertThat(result.getActive()).isTrue();
        verify(organizationRepository).findByName("Default Organization");
    }

    @Test
    @DisplayName("TC-ORG-003: Get default organization - throws exception when not found")
    void testGetDefaultOrganization_throwsExceptionWhenNotFound() {
        // Given
        when(organizationRepository.findByName("Default Organization")).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> organizationService.getDefaultOrganization())
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Default organization not found");

        verify(organizationRepository).findByName("Default Organization");
    }
}
