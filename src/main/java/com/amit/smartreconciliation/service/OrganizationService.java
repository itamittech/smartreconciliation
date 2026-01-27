package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.entity.Organization;
import com.amit.smartreconciliation.exception.ResourceNotFoundException;
import com.amit.smartreconciliation.repository.OrganizationRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrganizationService {

    private static final Logger log = LoggerFactory.getLogger(OrganizationService.class);

    private final OrganizationRepository organizationRepository;

    private static final String DEFAULT_ORG_NAME = "Default Organization";

    public OrganizationService(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

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
