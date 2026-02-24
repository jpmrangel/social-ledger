package com.socialledger.api.usecases;

/*
 * DeleteUserUseCase.java
 * Handles the safe deletion of a user, verifying their existence first.
 */

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.socialledger.api.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeleteUserUseCase {

  private final UserRepository userRepository;

  @Transactional
  public void execute(Long id) {
    if (!userRepository.existsById(id)) {
      throw new RuntimeException("User not found with id: " + id);
    }
    userRepository.deleteById(id);
  }
}