package com.socialledger.api.usecases;

/*
 * CreateUserUseCase.java
 * Creates "guest" users for simulations. It automatically generates 
 * a dummy domain email to safely distinguish them from fully registered accounts.
 */

import org.springframework.stereotype.Service;

import com.socialledger.api.dtos.UserResponseDTO;
import com.socialledger.api.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CreateUserUseCase {
  
  private final UserRepository userRepository;

  public UserResponseDTO execute(String name, String email) {
    // Generate a safe, identifiable dummy email for simulated users (e.g., "bob@simulation.local")
    String dummyEmail = name.toLowerCase().replace(" ", ".") + "@simulation.local";
    
    com.socialledger.api.models.User user = new com.socialledger.api.models.User();
    user.setName(name);
    user.setEmail(dummyEmail);
    
    return UserResponseDTO.fromEntity(userRepository.save(user));
  }
}