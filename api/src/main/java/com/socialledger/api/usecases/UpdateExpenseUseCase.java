package com.socialledger.api.usecases;

/*
 * UpdateExpenseUseCase.java
 * Updates an existing expense and safely replaces its financial splits.
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
public class UpdateExpenseUseCase {

  private final ExpenseRepository expenseRepository;
  private final UserRepository userRepository;
  private final GroupRepository groupRepository;

  @Transactional
  public ExpenseResponseDTO execute(Long expenseId, ExpenseRequestDTO dto) {
    Expense expense = expenseRepository.findById(expenseId)
            .orElseThrow(() -> new RuntimeException("Expense not found"));

    expense.setDescription(dto.getDescription());
    expense.setTotalAmount(dto.getTotalAmount());
    
    User payer = userRepository.findById(dto.getPayerId())
            .orElseThrow(() -> new RuntimeException("Payer not found"));
    Group group = groupRepository.findById(dto.getGroupId())
            .orElseThrow(() -> new RuntimeException("Group not found"));
    
    expense.setPayer(payer);
    expense.setGroup(group);

    expense.getSplits().clear();
    var newSplits = dto.getSplits().entrySet().stream().map(entry -> {
        User participant = userRepository.findById(entry.getKey())
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        
        ExpenseSplit split = new ExpenseSplit();
        split.setExpense(expense);
        split.setUser(participant);
        split.setAmount(entry.getValue());
        return split;
    }).collect(Collectors.toList());

    expense.getSplits().addAll(newSplits);

    Expense updated = expenseRepository.save(expense);
    
    // Delegate to the Mapper
    return ExpenseMapper.toResponseDTO(updated); 
  }
}