package com.socialledger.api.controllers;

/*
 * AuthController.java
 * Manages authentication HTTP endpoints. Delegates all business 
 * rules and database interactions to dedicated Use Cases.
 */

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.socialledger.api.dtos.LoginRequestDTO;
import com.socialledger.api.dtos.RegisterRequestDTO;
import com.socialledger.api.dtos.UserResponseDTO;
import com.socialledger.api.usecases.LoginUserUseCase;
import com.socialledger.api.usecases.RegisterUserUseCase;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

  private final RegisterUserUseCase registerUserUseCase;
  private final LoginUserUseCase loginUserUseCase;

  @PostMapping("/register")
  public ResponseEntity<UserResponseDTO> register(@RequestBody RegisterRequestDTO request) {
    // Basic payload validation in the controller
    if (!request.getPassword().equals(request.getConfirmation())) {
      throw new IllegalArgumentException("Passwords do not match");
    }
    return ResponseEntity.status(HttpStatus.CREATED)
            .body(registerUserUseCase.execute(request.getName(), request.getEmail(), request.getPassword()));
  }

  @PostMapping("/login")
  public ResponseEntity<UserResponseDTO> login(@RequestBody LoginRequestDTO request) {
    // Controller delegates to the use case and returns the result
    return ResponseEntity.ok(loginUserUseCase.execute(request.getEmail(), request.getPassword()));
  }
}