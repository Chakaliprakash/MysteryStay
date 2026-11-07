# ==============================================================================
# Multi-stage Dockerfile for MysteryStay Spring Boot Backend (Java 21)
# ==============================================================================

# Stage 1: Build JAR using Maven & Eclipse Temurin 21
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace

# Install Maven and cache dependencies
RUN apk add --no-cache maven
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package executable archive
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Hardened, minimal JRE 21 Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create unprivileged system user for container security
RUN addgroup -S mysterystay && adduser -S mysterystay -G mysterystay
USER mysterystay:mysterystay

COPY --from=builder --chown=mysterystay:mysterystay /workspace/target/mysterystay-backend-*.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/v1/health || exit 1

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
