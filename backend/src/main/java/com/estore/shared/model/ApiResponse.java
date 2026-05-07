package com.estore.shared.model;

public record ApiResponse<T>(boolean success, String message, T data) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, "Success", data);
    }

    public static <T> ApiResponse<T> ok(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
