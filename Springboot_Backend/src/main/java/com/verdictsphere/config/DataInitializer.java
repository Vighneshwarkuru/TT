package com.verdictsphere.config;

import com.verdictsphere.entity.Role;
import com.verdictsphere.entity.User;
import com.verdictsphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${admin1.email}")
    private String admin1Email;
    @Value("${admin1.password}")
    private String admin1Password;
    @Value("${admin1.firstName}")
    private String admin1FirstName;
    @Value("${admin1.lastName}")
    private String admin1LastName;

    @Value("${admin2.email}")
    private String admin2Email;
    @Value("${admin2.password}")
    private String admin2Password;
    @Value("${admin2.firstName}")
    private String admin2FirstName;
    @Value("${admin2.lastName}")
    private String admin2LastName;

    @Value("${admin3.email}")
    private String admin3Email;
    @Value("${admin3.password}")
    private String admin3Password;
    @Value("${admin3.firstName}")
    private String admin3FirstName;
    @Value("${admin3.lastName}")
    private String admin3LastName;

    @Override
    public void run(ApplicationArguments args) {
        seedAdmin(admin1Email, admin1Password, admin1FirstName, admin1LastName);
        seedAdmin(admin2Email, admin2Password, admin2FirstName, admin2LastName);
        seedAdmin(admin3Email, admin3Password, admin3FirstName, admin3LastName);
    }

    private void seedAdmin(String email, String rawPassword, String firstName, String lastName) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User admin = User.builder()
                    .email(email)
                    .passwordHash(passwordEncoder.encode(rawPassword))
                    .firstName(firstName)
                    .lastName(lastName)
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Seeded admin account: {}", email);
        } else {
            log.debug("Admin account already exists, skipping: {}", email);
        }
    }
}
