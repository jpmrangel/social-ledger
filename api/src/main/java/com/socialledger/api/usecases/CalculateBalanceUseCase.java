package com.socialledger.api.usecases;

/*
 * CalculateBalanceUseCase.java
 * Core financial engine. Calculates the net balance for every member 
 * in a group by subtracting their total owed splits from their total paid expenses.
 */

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.socialledger.api.dtos.BalanceDTO;
import com.socialledger.api.models.Expense;
import com.socialledger.api.models.ExpenseSplit;
import com.socialledger.api.models.Group;
import com.socialledger.api.repositories.GroupRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CalculateBalanceUseCase {

  private final GroupRepository groupRepository;

  public List<BalanceDTO> execute(Long groupId) {
    Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Group not found"));

    return group.getMembers().stream().map(user -> {
        // Sum of all expenses where this user was the one who paid the bill
        BigDecimal totalPaid = group.getExpenses().stream()
                .filter(e -> e.getPayer().getId().equals(user.getId()))
                .map(Expense::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Sum of all individual splits (debts) assigned to this user across all group expenses
        BigDecimal totalOwed = group.getExpenses().stream()
                .flatMap(e -> e.getSplits().stream())
                .filter(s -> s.getUser().getId().equals(user.getId()))
                .map(ExpenseSplit::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Net Balance = Paid - Owed (Positive means they are owed money, Negative means they owe)
        return new BalanceDTO(user.getId(), user.getName(), totalPaid.subtract(totalOwed));
    }).collect(Collectors.toList());
  }
}