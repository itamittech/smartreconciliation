package com.amit.smartreconciliation.service;

import com.amit.smartreconciliation.dto.request.CreateUserRequest;
import com.amit.smartreconciliation.dto.request.UpdateUserRequest;
import com.amit.smartreconciliation.dto.response.UserDetailResponse;
import com.amit.smartreconciliation.entity.Organization;
import com.amit.smartreconciliation.entity.User;
import com.amit.smartreconciliation.exception.ResourceNotFoundException;
import com.amit.smartreconciliation.repository.OrganizationRepository;
import com.amit.smartreconciliation.repository.UserRepository;
import com.amit.smartreconciliation.security.SecurityUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;

@Service
public class AdminService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository,
                        OrganizationRepository organizationRepository,
                        PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserDetailResponse> listUsers() {
        Long orgId = SecurityUtils.getCurrentOrgId();
        return userRepository.findByOrganizationId(orgId).stream()
                .map(UserDetailResponse::fromEntity)
                .toList();
    }

    @Transactional
    public CreateUserResult createUser(CreateUserRequest request) {
        Long orgId = SecurityUtils.getCurrentOrgId();
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", orgId));

        String tempPassword = generateTempPassword();

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        user.setActive(true);
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setMustChangePassword(true);
        user.setOrganization(org);

        User saved = userRepository.save(user);
        return new CreateUserResult(UserDetailResponse.fromEntity(saved), tempPassword);
    }

    @Transactional
    public UserDetailResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        return UserDetailResponse.fromEntity(userRepository.save(user));
    }

    public UserDetailResponse getUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        return UserDetailResponse.fromEntity(user);
    }

    private String generateTempPassword() {
        byte[] bytes = new byte[12];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public record CreateUserResult(UserDetailResponse user, String tempPassword) {}
}
