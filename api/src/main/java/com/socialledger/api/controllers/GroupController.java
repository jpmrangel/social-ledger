package com.socialledger.api.controllers;

/*
 * GroupController.java
 * Routes HTTP requests for group management and financial calculations 
 * strictly to their dedicated Use Cases, maintaining a clean architectural boundary.
 */

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.socialledger.api.dtos.BalanceDTO;
import com.socialledger.api.dtos.ExpenseResponseDTO;
import com.socialledger.api.dtos.GroupRequestDTO;
import com.socialledger.api.dtos.GroupResponseDTO;
import com.socialledger.api.dtos.SettlementDTO;
import com.socialledger.api.usecases.CalculateBalanceUseCase;
import com.socialledger.api.usecases.CreateGroupUseCase;
import com.socialledger.api.usecases.DeleteGroupUseCase;
import com.socialledger.api.usecases.GetAllGroupsUseCase;
import com.socialledger.api.usecases.GetGroupExpensesUseCase;
import com.socialledger.api.usecases.GetGroupUseCase;
import com.socialledger.api.usecases.SettleDebtsUseCase;
import com.socialledger.api.usecases.UpdateGroupUseCase;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

  private final CreateGroupUseCase createGroupUseCase;
  private final UpdateGroupUseCase updateGroupUseCase;
  private final GetGroupUseCase getGroupUseCase;
  private final GetAllGroupsUseCase getAllGroupsUseCase;
  private final DeleteGroupUseCase deleteGroupUseCase;

  private final CalculateBalanceUseCase calculateBalanceUseCase;
  private final SettleDebtsUseCase settleDebtsUseCase;
  private final GetGroupExpensesUseCase getGroupExpensesUseCase;

  // --- Group CRUD Operations ---

  @PostMapping
  public ResponseEntity<GroupResponseDTO> createGroup(
          @RequestBody GroupRequestDTO request,
          @RequestHeader("X-User-Id") Long currentUserId) {
    return ResponseEntity.status(HttpStatus.CREATED)
            .body(createGroupUseCase.execute(request.getName(), request.getUserIds(), currentUserId));
  }

  @PutMapping("/{id}")
  public ResponseEntity<GroupResponseDTO> updateGroup(
          @PathVariable Long id,
          @RequestBody GroupRequestDTO request) {
    return ResponseEntity.ok(updateGroupUseCase.execute(id, request.getName(), request.getUserIds()));
  }
  
  @GetMapping("/{id}")
  public ResponseEntity<GroupResponseDTO> getGroupById(@PathVariable Long id) {
    return ResponseEntity.ok(getGroupUseCase.execute(id));
  }

  @GetMapping
  public ResponseEntity<List<GroupResponseDTO>> getAllGroups(@RequestHeader("X-User-Id") Long currentUserId) {
    return ResponseEntity.ok(getAllGroupsUseCase.execute(currentUserId));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteGroup(@PathVariable Long id) {
    deleteGroupUseCase.execute(id);
    return ResponseEntity.noContent().build();
  }

  // --- Financial & Settlement Operations ---

  @GetMapping("/{id}/balances")
  public ResponseEntity<List<BalanceDTO>> getBalances(@PathVariable Long id) {
    return ResponseEntity.ok(calculateBalanceUseCase.execute(id));
  }

  @GetMapping("/{id}/settle")
  public ResponseEntity<List<SettlementDTO>> getSettlements(@PathVariable Long id) {
    return ResponseEntity.ok(settleDebtsUseCase.execute(id));
  }

  @GetMapping("/{id}/expenses")
  public ResponseEntity<List<ExpenseResponseDTO>> getGroupExpenses(@PathVariable Long id) {
    return ResponseEntity.ok(getGroupExpensesUseCase.execute(id));
  }
}