package com.mysterystay.common.health;

import java.time.Instant;
import java.util.Map;

public record HealthStatusDto(
        String status,
        String service,
        String version,
        Instant timestamp,
        Map<String, Object> details
) {}
