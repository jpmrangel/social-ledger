package com.socialledger.api.controllers;

/*
 * UserController.java
 * REST controller routing user-related operations (creation, retrieval, 
 * deletion, and financial summaries) to their specific use cases.
 */

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.socialledger.api.dtos.UserRequestDTO;
import com.socialledger.api.dtos.UserResponseDTO;
import com.socialledger.api.usecases.CreateUserUseCase;
import com.socialledger.api.usecases.DeleteUserUseCase;
import com.socialledger.api.usecases.GetAllUsersUseCase;
import com.socialledger.api.usecases.GetUserSummaryUseCase;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

  private final CreateUserUseCase createUserUseCase;
  private final GetUserSummaryUseCase getUserSummaryUseCase;
  private final GetAllUsersUseCase getAllUsersUseCase;
  private final DeleteUserUseCase deleteUserUseCase;

  // --- User Management Operations ---

  @PostMapping
  public ResponseEntity<UserResponseDTO> createUser(@RequestBody UserRequestDTO request) {
    return ResponseEntity.status(HttpStatus.CREATED)
            .body(createUserUseCase.execute(request.getName(), null)); // null email indicates a 'simulated' guest user
  }

  @GetMapping
  public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
    return ResponseEntity.ok(getAllUsersUseCase.execute());
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    deleteUserUseCase.execute(id);
    return ResponseEntity.noContent().build();
  }

  // --- Financial Summary Operations ---

  @GetMapping("/{id}/summary")
  public ResponseEntity<Map<String, BigDecimal>> getUserSummary(@PathVariable Long id) {
    BigDecimal netBalance = getUserSummaryUseCase.execute(id);
    // Wrap the single value in a Map to return proper JSON format
    return ResponseEntity.ok(Map.of("netBalance", netBalance));
  }
}