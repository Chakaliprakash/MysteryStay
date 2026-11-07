package com.mysterystay;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class MysteryStayApplicationTests {

    @Test
    @DisplayName("Application context loads successfully with test profile")
    void contextLoads() {
        // Verifies Spring context, Flyway migration execution, and bean wiring
    }
}
