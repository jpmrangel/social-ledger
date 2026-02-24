package com.socialledger.api.usecases;

/*
 * LoginUserUseCase.java
 * Handles the business logic for user authentication,
 * keeping the controller clean and decoupled from the repository.
 */

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.socialledger.api.dtos.UserResponseDTO;
import com.socialledger.api.models.User;
import com.socialledger.api.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LoginUserUseCase {

  private final UserRepository userRepository;
  private final BCryptPasswordEncoder passwordEncoder;

  public UserResponseDTO execute(String email, String password) {
    // Find user by email
    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    // Verify password matches the stored hash
    if (!passwordEncoder.matches(password, user.getPasswordHash())) {
      throw new RuntimeException("Invalid credentials");
    }

    // Return the sanitized DTO
    return UserResponseDTO.fromEntity(user);
  }
}