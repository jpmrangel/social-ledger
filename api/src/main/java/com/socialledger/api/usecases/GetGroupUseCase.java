package com.socialledger.api.usecases;

/*
 * GetGroupUseCase.java
 * Fetches details for a single specific group by its ID.
 */

import org.springframework.stereotype.Service;

import com.socialledger.api.dtos.GroupResponseDTO;
import com.socialledger.api.exceptions.ResourceNotFoundException;
import com.socialledger.api.repositories.GroupRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GetGroupUseCase {
  
  private final GroupRepository groupRepository;

  public GroupResponseDTO execute(Long id) {
    return groupRepository.findById(id)
        .map(group -> GroupResponseDTO.fromEntity(group, true))
        .orElseThrow(() -> new ResourceNotFoundException("Group not found with id: " + id));
  }
}
