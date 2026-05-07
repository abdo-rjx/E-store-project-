package com.estore.shared.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Resolve uploads path correctly regardless of working directory
        Path currentDir = Paths.get(System.getProperty("user.dir")).toAbsolutePath().normalize();
        String dirName = currentDir.getFileName().toString();

        Path uploadPath;
        if ("backend".equals(dirName)) {
            uploadPath = currentDir.resolve("src/main/resources/static/uploads");
        } else {
            uploadPath = currentDir.resolve("backend/src/main/resources/static/uploads");
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath.toUri().toString() + "/")
                .setCachePeriod(0);
    }
}
