package com.socialledger.api.usecases;

/*
 * GetUserSummaryUseCase.java
 * Aggregates a user's total net balance across all the groups 
 * they participate in to display on their main profile dashboard.
 */

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.socialledger.api.dtos.BalanceDTO;
import com.socialledger.api.models.Group;
import com.socialledger.api.repositories.GroupRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GetUserSummaryUseCase {
    
  private final CalculateBalanceUseCase calculateBalanceUseCase;
  private final GroupRepository groupRepository;

  public BigDecimal execute(Long userId) {
    // Find all groups where this user is a member
    List<Group> userGroups = groupRepository.findAll().stream()
            .filter(g -> g.getMembers().stream().anyMatch(m -> m.getId().equals(userId)))
            .toList();

    // Sum up the user's net balance extracted from each group's calculations
    return userGroups.stream()
            .map(g -> calculateBalanceUseCase.execute(g.getId()))
            .flatMap(List::stream)
            .filter(b -> b.getUserId().equals(userId))
            .map(BalanceDTO::getNetBalance)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
  }
}