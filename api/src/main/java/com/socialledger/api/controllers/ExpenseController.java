package com.socialledger.api.controllers;

/*
 * ExpenseController.java
 * REST controller routing expense operations to their specific use cases.
 */

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.socialledger.api.dtos.ExpenseRequestDTO;
import com.socialledger.api.dtos.ExpenseResponseDTO;
import com.socialledger.api.usecases.CreateExpenseUseCase;
import com.socialledger.api.usecases.DeleteExpenseUseCase;
import com.socialledger.api.usecases.UpdateExpenseUseCase;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

  private final CreateExpenseUseCase createExpenseUseCase;
  private final UpdateExpenseUseCase updateExpenseUseCase;
  private final DeleteExpenseUseCase deleteExpenseUseCase;

  @PostMapping
  public ResponseEntity<ExpenseResponseDTO> createExpense(@RequestBody ExpenseRequestDTO request) {
    return ResponseEntity.ok(createExpenseUseCase.execute(request));
  }

  @PutMapping("/{id}")
  public ResponseEntity<ExpenseResponseDTO> updateExpense(
          @PathVariable Long id, 
          @RequestBody ExpenseRequestDTO request) {
    return ResponseEntity.ok(updateExpenseUseCase.execute(id, request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
    deleteExpenseUseCase.execute(id);
    return ResponseEntity.noContent().build();
  }
}