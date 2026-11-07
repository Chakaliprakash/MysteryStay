package com.mysterystay.common.health;

import com.mysterystay.common.response.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class HealthCheckController {

    private static final Logger log = LoggerFactory.getLogger(HealthCheckController.class);
    private final DataSource dataSource;

    public HealthCheckController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<HealthStatusDto>> checkHealth() {
        Map<String, Object> details = new LinkedHashMap<>();
        boolean dbHealthy = false;

        try (Connection connection = dataSource.getConnection()) {
            dbHealthy = connection.isValid(2);
            details.put("database", dbHealthy ? "UP" : "DOWN");
            details.put("databaseProductName", connection.getMetaData().getDatabaseProductName());
        } catch (Exception e) {
            log.error("Database connectivity check failed: {}", e.getMessage());
            details.put("database", "DOWN");
            details.put("error", e.getMessage());
        }

        String overallStatus = dbHealthy ? "UP" : "DEGRADED";
        HealthStatusDto dto = new HealthStatusDto(
                overallStatus,
                "MysteryStay Monolith",
                "1.0.0-PHASE1",
                Instant.now(),
                details
        );

        return ResponseEntity.ok(ApiResponse.success(dto, "Health check completed"));
    }
}
