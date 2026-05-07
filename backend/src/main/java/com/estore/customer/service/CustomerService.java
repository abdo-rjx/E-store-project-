package com.estore.customer.service;

import com.estore.customer.dto.ProfileDto;
import com.estore.customer.entity.Profile;
import com.estore.customer.entity.User;
import com.estore.customer.repository.ProfileRepository;
import com.estore.customer.repository.UserRepository;
import com.estore.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;

    public CustomerService(UserRepository userRepository, ProfileRepository profileRepository) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
    }

    public ProfileDto getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        return mapToDto(profile);
    }

    @Transactional
    public ProfileDto updateProfile(String email, ProfileDto request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Profile profile = profileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        profile.setPhone(request.phone());
        profile.setAddress(request.address());
        profile.setCity(request.city());
        profile.setCountry(request.country());

        profile = profileRepository.save(profile);
        return mapToDto(profile);
    }

    private ProfileDto mapToDto(Profile profile) {
        return new ProfileDto(
                profile.getId(),
                profile.getPhone(),
                profile.getAddress(),
                profile.getCity(),
                profile.getCountry()
        );
    }
}
