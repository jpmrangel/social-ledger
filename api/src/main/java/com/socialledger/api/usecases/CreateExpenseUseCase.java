package com.socialledger.api.usecases;

/*
 * CreateExpenseUseCase.java
 * Handles the creation of a new group expense and its associated splits.
 * Uses @Transactional to ensure atomicity (all-or-nothing database saves).
 */

import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.socialledger.api.dtos.ExpenseRequestDTO;
import com.socialledger.api.dtos.ExpenseResponseDTO;
import com.socialledger.api.mappers.ExpenseMapper;
import com.socialledger.api.models.Expense;
import com.socialledger.api.models.ExpenseSplit;
import com.socialledger.api.models.Group;
import com.socialledger.api.models.User;
import com.socialledger.api.repositories.ExpenseRepository;
import com.socialledger.api.repositories.GroupRepository;
import com.socialledger.api.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CreateExpenseUseCase {

  private final ExpenseRepository expenseRepository;
  private final UserRepository userRepository;
  private final GroupRepository groupRepository;

  @Transactional
  public ExpenseResponseDTO execute(ExpenseRequestDTO dto) {
    User payer = userRepository.findById(dto.getPayerId())
            .orElseThrow(() -> new RuntimeException("Payer not found"));
    Group group = groupRepository.findById(dto.getGroupId())
            .orElseThrow(() -> new RuntimeException("Group not found"));

    Expense expense = new Expense();
    expense.setDescription(dto.getDescription());
    expense.setTotalAmount(dto.getTotalAmount());
    expense.setPayer(payer);
    expense.setGroup(group);

    var splits = dto.getSplits().entrySet().stream().map(entry -> {
        User participant = userRepository.findById(entry.getKey())
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        ExpenseSplit split = new ExpenseSplit();
        split.setExpense(expense);
        split.setUser(participant);
        split.setAmount(entry.getValue());
        return split;
    }).collect(Collectors.toList());

    expense.setSplits(splits);
    
    Expense saved = expenseRepository.save(expense);
    
    return ExpenseMapper.toResponseDTO(saved);
  }
}