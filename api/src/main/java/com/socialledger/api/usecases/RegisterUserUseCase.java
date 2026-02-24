package com.socialledger.api.usecases;

/*
 * RegisterUserUseCase.java
 * Handles the registration of new "real" users, checking for email 
 * collisions and securely hashing passwords before saving to PostgreSQL.
 */

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.socialledger.api.dtos.UserResponseDTO;
import com.socialledger.api.models.User;
import com.socialledger.api.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RegisterUserUseCase {
  
  private final UserRepository userRepository;
  private final BCryptPasswordEncoder passwordEncoder;

  public UserResponseDTO execute(String name, String email, String password) {
    // Prevent duplicate accounts
    if (userRepository.findByEmail(email).isPresent()) {
      throw new IllegalArgumentException("Email already in use");
    }

    User user = new User();
    user.setName(name);
    user.setEmail(email);
    user.setPasswordHash(passwordEncoder.encode(password));

    return UserResponseDTO.fromEntity(userRepository.save(user));
  }
}