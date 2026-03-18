package com.verdictsphere.util;

import com.verdictsphere.entity.User;
import com.verdictsphere.exception.EntityNotFoundException;
import com.verdictsphere.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    private SecurityUtils() {}

    public static User getCurrentUser(UserRepository userRepository) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Authenticated user not found: " + email));
    }
}
