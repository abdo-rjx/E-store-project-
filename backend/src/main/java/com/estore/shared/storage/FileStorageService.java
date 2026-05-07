package com.estore.shared.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    private Path uploadRoot;

    private static final Set<String> ALLOWED_IMAGES = Set.of("jpg", "jpeg", "png", "gif", "webp");
    private static final Set<String> ALLOWED_VIDEOS = Set.of("mp4", "webm", "ogg");
    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final long MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

    @PostConstruct
    public void init() {
        Path baseDir = Paths.get(System.getProperty("user.dir")).toAbsolutePath().normalize();

        if (baseDir.endsWith("backend")) {
            uploadRoot = baseDir.resolve("src/main/resources/static/uploads");
        } else {
            uploadRoot = baseDir.resolve("backend/src/main/resources/static/uploads");
        }

        try {
            Files.createDirectories(uploadRoot.resolve("images"));
            Files.createDirectories(uploadRoot.resolve("videos"));
            log.info("Upload directory initialized: {}", uploadRoot);
        } catch (IOException e) {
            log.error("Failed to create upload directories: {}", e.getMessage());
            throw new RuntimeException("Cannot initialize upload directories", e);
        }
    }

    public String storeImage(MultipartFile file) {
        validateFile(file, ALLOWED_IMAGES, MAX_IMAGE_SIZE, "Image");
        return doStore(file, "images");
    }

    public String storeVideo(MultipartFile file) {
        validateFile(file, ALLOWED_VIDEOS, MAX_VIDEO_SIZE, "Video");
        return doStore(file, "videos");
    }

    private String doStore(MultipartFile file, String subDir) {
        Path dir = uploadRoot.resolve(subDir);
        try {
            Files.createDirectories(dir);

            String fileName = generateFileName(file.getOriginalFilename());
            Path target = dir.resolve(fileName);

            log.info("Storing {} to {}", subDir, target);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + subDir + "/" + fileName;
        } catch (IOException e) {
            log.error("Failed to store {}: {}", subDir, e.getMessage());
            throw new RuntimeException("Failed to store " + subDir + ": " + e.getMessage(), e);
        }
    }

    public void deleteFile(String filePath) {
        if (filePath == null || filePath.isBlank()) return;
        try {
            Path fullPath = uploadRoot.resolve(filePath.replace("/uploads/", ""));
            Files.deleteIfExists(fullPath);
        } catch (IOException e) {
            log.warn("Could not delete file: {}", e.getMessage());
        }
    }

    public Path getUploadRoot() {
        return uploadRoot;
    }

    private void validateFile(MultipartFile file, Set<String> allowedExtensions, long maxSize, String type) {
        String originalName = file.getOriginalFilename();
        log.info("Validating {} file: name={}, size={}", type, originalName, file.getSize());

        if (file.isEmpty()) {
            throw new IllegalArgumentException(type + " file is empty");
        }
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException(type + " file exceeds maximum size of " + (maxSize / 1024 / 1024) + "MB");
        }
        String extension = getExtension(originalName);
        if (extension.isEmpty()) {
            throw new IllegalArgumentException(type + " file has no extension: " + originalName);
        }
        if (!allowedExtensions.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException(type + " file type not allowed (. " + extension + "). Allowed: " + allowedExtensions);
        }
    }

    private String generateFileName(String originalFilename) {
        String ext = getExtension(originalFilename);
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        long timestamp = System.currentTimeMillis();
        return uuid + "_" + timestamp + "." + ext;
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }
}
