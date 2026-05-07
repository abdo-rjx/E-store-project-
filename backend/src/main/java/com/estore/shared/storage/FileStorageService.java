package com.estore.shared.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    private final Path uploadRoot;

    private static final Set<String> ALLOWED_IMAGES = Set.of("jpg", "jpeg", "png", "gif", "webp");
    private static final Set<String> ALLOWED_VIDEOS = Set.of("mp4", "webm", "ogg");
    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    private static final long MAX_VIDEO_SIZE = 50 * 1024 * 1024;

    public FileStorageService() {
        Path currentDir = Paths.get("").toAbsolutePath().normalize();
        String dirName = currentDir.getFileName().toString();

        if ("backend".equals(dirName)) {
            uploadRoot = currentDir.resolve("src/main/resources/static/uploads");
        } else {
            uploadRoot = currentDir.resolve("backend/src/main/resources/static/uploads");
        }

        try {
            Files.createDirectories(uploadRoot.resolve("images"));
            Files.createDirectories(uploadRoot.resolve("videos"));
        } catch (IOException e) {
            throw new RuntimeException("Cannot create upload directories at: " + uploadRoot, e);
        }

        log.info("FileStorageService initialized. Upload root: {}", uploadRoot);
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

            String originalName = file.getOriginalFilename();
            if (originalName == null || originalName.isBlank()) {
                throw new IllegalArgumentException("File has no name");
            }

            String fileName = generateFileName(originalName);
            Path target = dir.resolve(fileName);

            log.info("Saving {} '{}' ({} bytes) to {}", subDir, originalName, file.getSize(), target);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            String storedPath = "/uploads/" + subDir + "/" + fileName;
            log.info("File stored successfully: {}", storedPath);
            return storedPath;
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
        log.info("Validating {}: name='{}', contentType='{}', size={} bytes",
                type, originalName, file.getContentType(), file.getSize());

        if (file.isEmpty()) {
            throw new IllegalArgumentException(type + " file is empty");
        }
        if (file.getSize() > maxSize) {
            long maxMB = maxSize / 1024 / 1024;
            double actualMB = file.getSize() / (1024.0 * 1024.0);
            throw new IllegalArgumentException(type + " too large: " + String.format("%.1f", actualMB) + "MB (max " + maxMB + "MB)");
        }
        String extension = getExtension(originalName);
        if (extension.isEmpty()) {
            throw new IllegalArgumentException(type + " has no file extension: " + originalName);
        }
        if (!allowedExtensions.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException(type + " type '." + extension + "' not allowed. Allowed: jpg, jpeg, png, gif, webp");
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
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }
}
