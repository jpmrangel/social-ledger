package com.socialledger.api.mappers;

/*
 * ExpenseMapper.java
 * Centralizes the conversion logic between Expense database entities
 * and Data Transfer Objects (DTOs). Keeps use cases clean and adheres to DRY.
 */

import java.util.stream.Collectors;

import com.socialledger.api.dtos.ExpenseResponseDTO;
import com.socialledger.api.dtos.ExpenseSplitDTO;
import com.socialledger.api.dtos.UserResponseDTO;
import com.socialledger.api.models.Expense;

public class ExpenseMapper {

  public static ExpenseResponseDTO toResponseDTO(Expense expense) {
    return ExpenseResponseDTO.builder()
            .id(expense.getId())
            .description(expense.getDescription())
            .totalAmount(expense.getTotalAmount())
            .createdAt(expense.getCreatedAt())
            .payer(new UserResponseDTO(
                expense.getPayer().getId(), 
                expense.getPayer().getName(), 
                expense.getPayer().getEmail()
            ))
            .splits(expense.getSplits().stream()
                    .map(split -> new ExpenseSplitDTO(
                        split.getUser().getId(), 
                        split.getUser().getName(), 
                        split.getAmount()
                    )).collect(Collectors.toList()))
            .build();
  }
}