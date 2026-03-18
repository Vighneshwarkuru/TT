package com.verdictsphere.service;

import com.verdictsphere.dto.AuthResponse;
import com.verdictsphere.dto.LoginRequest;
import com.verdictsphere.dto.RefreshTokenRequest;
import com.verdictsphere.dto.RegisterRequest;
import com.verdictsphere.dto.UserResponse;
import com.verdictsphere.entity.RefreshToken;
import com.verdictsphere.entity.Role;
import com.verdictsphere.entity.User;
import com.verdictsphere.exception.EmailAlreadyExistsException;
import com.verdictsphere.exception.InvalidCredentialsException;
import com.verdictsphere.exception.InvalidTokenException;
import com.verdictsphere.repository.RefreshTokenRepository;
import com.verdictsphere.repository.UserRepository;
import com.verdictsphere.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public UserResponse register(RegisterRequest req) {
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already in use: " + req.getEmail());
        }

        User user = User.builder()
                .email(req.getEmail())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .firstName(req.getFirstName())
                .lastName(req.getLastName())
                .role(Role.PARTICIPANT)
                .build();

        User saved = userRepository.save(user);

        return UserResponse.builder()
                .id(saved.getId())
                .email(saved.getEmail())
                .firstName(saved.getFirstName())
                .lastName(saved.getLastName())
                .role(saved.getRole().name())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String jwt = jwtUtil.generateToken(user);

        String rawToken = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(rawToken)
                .expiresAt(Instant.now().plus(7, ChronoUnit.DAYS))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .jwt(jwt)
                .refreshToken(rawToken)
                .role(user.getRole().name())
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest req) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(req.getRefreshToken())
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired refresh token"));

        if (refreshToken.isRevoked() || refreshToken.getExpiresAt().isBefore(Instant.now())) {
            throw new InvalidTokenException("Invalid or expired refresh token");
        }

        User user = refreshToken.getUser();
        String newJwt = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .jwt(newJwt)
                .refreshToken(refreshToken.getToken())
                .role(user.getRole().name())
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }
}
