package com.socialledger.api.usecases;

/*
 * GetGroupExpensesUseCase.java
 * Fetches all expenses tied to a specific group and maps them 
 * securely using the centralized ExpenseMapper to maintain DRY principles.
 */

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.socialledger.api.dtos.ExpenseResponseDTO;
import com.socialledger.api.mappers.ExpenseMapper;
import com.socialledger.api.models.Group;
import com.socialledger.api.repositories.GroupRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GetGroupExpensesUseCase {

  private final GroupRepository groupRepository;

  public List<ExpenseResponseDTO> execute(Long groupId) {
    Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Group not found"));

    return group.getExpenses().stream()
        .map(ExpenseMapper::toResponseDTO)
        .collect(Collectors.toList());
  }
}
