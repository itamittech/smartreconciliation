package com.amit.smartreconciliation.repository;

import com.amit.smartreconciliation.entity.UploadedFile;
import com.amit.smartreconciliation.enums.FileStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UploadedFileRepository extends JpaRepository<UploadedFile, Long> {
    List<UploadedFile> findByOrganizationId(Long organizationId);
    List<UploadedFile> findByOrganizationIdAndStatus(Long organizationId, FileStatus status);
    List<UploadedFile> findByDataSourceId(Long dataSourceId);
}
