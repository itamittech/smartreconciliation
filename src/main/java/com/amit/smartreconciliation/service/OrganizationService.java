package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.entity.Organization;
import com.amit.smartreconciliation.exception.ResourceNotFoundException;
import com.amit.smartreconciliation.repository.OrganizationRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrganizationService {

    private final OrganizationRepository organizationRepository;

    private static final String DEFAULT_ORG_NAME = "Default Organization";

    @PostConstruct
    @Transactional
    public void initDefaultOrganization() {
        if (!organizationRepository.existsByName(DEFAULT_ORG_NAME)) {
            Organization org = Organization.builder()
                    .name(DEFAULT_ORG_NAME)
                    .description("Default organization for the MVP")
                    .active(true)
                    .build();
            organizationRepository.save(org);
            log.info("Created default organization: {}", DEFAULT_ORG_NAME);
        }
    }

    public Organization getDefaultOrganization() {
        return organizationRepository.findByName(DEFAULT_ORG_NAME)
                .orElseThrow(() -> new ResourceNotFoundException("Default organization not found"));
    }

    public Organization getById(Long id) {
        return organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", id));
    }
}
