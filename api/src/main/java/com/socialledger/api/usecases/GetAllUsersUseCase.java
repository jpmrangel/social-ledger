package com.socialledger.api.usecases;

/*
 * GetAllUsersUseCase.java
 * Fetches all users from the database and maps them to secure DTOs,
 * preventing the controller from interacting directly with the repository.
 */

import java.util.List;

import org.springframework.stereotype.Service;

import com.socialledger.api.dtos.UserResponseDTO;
import com.socialledger.api.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GetAllUsersUseCase {

  private final UserRepository userRepository;

  public List<UserResponseDTO> execute() {
    return userRepository.findAll().stream()
            .map(UserResponseDTO::fromEntity)
            .toList();
  }
}