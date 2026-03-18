package com.verdictsphere.service;

import com.verdictsphere.dto.CreateJudgeRequest;
import com.verdictsphere.dto.UserResponse;
import com.verdictsphere.entity.Role;
import com.verdictsphere.entity.User;
import com.verdictsphere.exception.EmailAlreadyExistsException;
import com.verdictsphere.exception.EntityNotFoundException;
import com.verdictsphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Transactional
    public UserResponse createJudge(CreateJudgeRequest req, Long actorUserId) {
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already in use: " + req.getEmail());
        }

        User judge = User.builder()
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .role(Role.JUDGE)
                .build();

        User saved = userRepository.save(judge);

        auditService.log(actorUserId, "CREATE_JUDGE", "USER", saved.getId(),
                "Created judge: " + saved.getEmail(), null);

        return toUserResponse(saved);
    }

    public List<UserResponse> getAllJudges() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.JUDGE)
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteJudge(Long id, Long actorUserId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Judge not found with id: " + id));

        if (user.getRole() != Role.JUDGE) {
            throw new EntityNotFoundException("User with id " + id + " is not a judge");
        }

        userRepository.delete(user);

        auditService.log(actorUserId, "DELETE_JUDGE", "USER", id,
                "Deleted judge: " + user.getEmail(), null);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
