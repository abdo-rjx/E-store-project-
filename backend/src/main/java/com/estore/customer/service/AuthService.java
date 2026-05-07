package com.estore.customer.service;

import com.estore.customer.dto.AuthResponse;
import com.estore.customer.dto.LoginRequest;
import com.estore.customer.dto.RegisterRequest;
import com.estore.customer.entity.Profile;
import com.estore.customer.entity.User;
import com.estore.customer.repository.UserRepository;
import com.estore.shared.config.JwtService;
import com.estore.shared.exception.EmailAlreadyExistsException;
import com.estore.shared.exception.ResourceNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException("Email already exists: " + request.email());
        }

        User user = User.builder()
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role("USER")
                .build();

        Profile profile = Profile.builder()
                .user(user)
                .build();
        user.setProfile(profile);

        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail(), user.getRole());

        return new AuthResponse(
                token,
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.getId()
        );
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ResourceNotFoundException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole());

        return new AuthResponse(
                token,
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.getId()
        );
    }
}
