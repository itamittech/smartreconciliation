package com.amit.smartreconciliation.repository;

import com.amit.smartreconciliation.entity.DataSource;
import com.amit.smartreconciliation.enums.DataSourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DataSourceRepository extends JpaRepository<DataSource, Long> {
    List<DataSource> findByOrganizationId(Long organizationId);
    List<DataSource> findByOrganizationIdAndType(Long organizationId, DataSourceType type);
    List<DataSource> findByOrganizationIdAndActiveTrue(Long organizationId);
}
