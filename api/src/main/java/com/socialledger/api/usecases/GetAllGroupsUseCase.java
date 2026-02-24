package com.socialledger.api.usecases;

/*
 * GetAllGroupsUseCase.java
 * Retrieves all simulation groups owned by the currently logged-in user,
 * ensuring users only see their own simulations.
 */

import java.util.List;

import org.springframework.stereotype.Service;

import com.socialledger.api.dtos.GroupResponseDTO;
import com.socialledger.api.repositories.GroupRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GetAllGroupsUseCase {

  private final GroupRepository groupRepository;

  public List<GroupResponseDTO> execute(Long currentUserId) {
    return groupRepository.findAllByOwnerId(currentUserId).stream()
            .map(group -> GroupResponseDTO.fromEntity(group, true))
            .toList();
  }
}