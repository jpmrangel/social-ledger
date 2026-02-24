package com.socialledger.api.usecases;

/*
 * DeleteGroupUseCase.java
 * Deletes a simulation group and its member associations 
 * without deleting the actual user accounts.
 */

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.socialledger.api.repositories.GroupRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeleteGroupUseCase {
  
  private final GroupRepository groupRepository;

  @Transactional
  public void execute(Long groupId) {
    // This removes the group and cascades to the group_members join table,
    // but the underlying User entities remain safe.
    groupRepository.deleteById(groupId);
  }
}