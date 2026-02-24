package com.socialledger.api.usecases;

/*
 * DeleteExpenseUseCase.java
 * Validates the existence of an expense before attempting deletion.
 */

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.socialledger.api.repositories.ExpenseRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeleteExpenseUseCase {

  private final ExpenseRepository expenseRepository;

  @Transactional
  public void execute(Long expenseId) {
    if (!expenseRepository.existsById(expenseId)) {
      throw new RuntimeException("Expense not found with id: " + expenseId);
    }
    expenseRepository.deleteById(expenseId);
  }
}