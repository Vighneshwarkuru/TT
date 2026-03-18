package com.verdictsphere;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

// Requires a running MySQL instance — enable once DB is available
@Disabled("Requires MySQL DB — enable with test DB or Testcontainers")
@SpringBootTest
class VerdictSphereApplicationTests {

    @Test
    void contextLoads() {
    }
}
