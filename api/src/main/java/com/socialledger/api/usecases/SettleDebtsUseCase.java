package com.socialledger.api.usecases;

/*
 * SettleDebtsUseCase.java
 * The core algorithmic engine of the application. Uses a greedy 
 * approach with Priority Queues to calculate the minimum number of money 
 * transfers required to settle all debts within a group.
 */

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.PriorityQueue;

import org.springframework.stereotype.Service;

import com.socialledger.api.dtos.BalanceDTO;
import com.socialledger.api.dtos.SettlementDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SettleDebtsUseCase {

  private final CalculateBalanceUseCase calculateBalanceUseCase;

  public List<SettlementDTO> execute(Long groupId) {
    List<BalanceDTO> balances = calculateBalanceUseCase.execute(groupId);
    List<SettlementDTO> settlements = new ArrayList<>();

    // Separate members into two Priority Queues:
    // Creditors (owed money) sorted highest to lowest
    // Debtors (owe money) sorted lowest to highest (most negative first)
    PriorityQueue<BalanceDTO> creditors = new PriorityQueue<>((a, b) -> b.getNetBalance().compareTo(a.getNetBalance()));
    PriorityQueue<BalanceDTO> debtors = new PriorityQueue<>((a, b) -> a.getNetBalance().compareTo(b.getNetBalance()));

    for (BalanceDTO b : balances) {
      if (b.getNetBalance().compareTo(BigDecimal.ZERO) > 0) creditors.add(b);
      else if (b.getNetBalance().compareTo(BigDecimal.ZERO) < 0) debtors.add(b);
    }

    // Greedily match the highest debtor with the highest creditor
    while (!creditors.isEmpty() && !debtors.isEmpty()) {
      BalanceDTO creditor = creditors.poll();
      BalanceDTO debtor = debtors.poll();

      // The transfer amount is the smaller of the two absolute balances
      BigDecimal amountToTransfer = creditor.getNetBalance().min(debtor.getNetBalance().abs());

      settlements.add(new SettlementDTO(
        debtor.getUserId(), debtor.getUserName(),
        creditor.getUserId(), creditor.getUserName(),
        amountToTransfer
      ));

      // Adjust balances after the simulated transfer
      creditor.setNetBalance(creditor.getNetBalance().subtract(amountToTransfer));
      debtor.setNetBalance(debtor.getNetBalance().add(amountToTransfer));

      // If they aren't fully settled (allowing for a 1-cent rounding margin), put them back in the queue
      if (creditor.getNetBalance().compareTo(BigDecimal.valueOf(0.01)) > 0) creditors.add(creditor);
      if (debtor.getNetBalance().compareTo(BigDecimal.valueOf(-0.01)) < 0) debtors.add(debtor);
    }

    return settlements;
  }
}