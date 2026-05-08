package com.estore.shared.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationStartedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Component
public class JwtSecretValidator implements ApplicationListener<ApplicationStartedEvent> {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Override
    public void onApplicationEvent(ApplicationStartedEvent event) {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException("JWT_SECRET environment variable is not set");
        }
    }
}
