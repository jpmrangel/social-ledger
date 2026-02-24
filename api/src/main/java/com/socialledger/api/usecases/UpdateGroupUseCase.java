package com.socialledger.api.usecases;

/*
 * UpdateGroupUseCase.java
 * Safely updates a group's name and completely replaces its member 
 * list. Uses @Transactional to ensure database consistency during the swap.
 */

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.socialledger.api.dtos.GroupResponseDTO;
import com.socialledger.api.models.Group;
import com.socialledger.api.repositories.GroupRepository;
import com.socialledger.api.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UpdateGroupUseCase {
  
  private final GroupRepository groupRepository;
  private final UserRepository userRepository;

  @Transactional
  public GroupResponseDTO execute(Long groupId, String name, List<Long> userIds) {
    Group group = groupRepository.findById(groupId)
            .orElseThrow(() -> new RuntimeException("Group not found"));
    
    group.setName(name);
    group.getMembers().clear();
    
    // Efficiently bulk-fetches all new members and adds them to the group
    group.getMembers().addAll(userRepository.findAllById(userIds));
    
    return GroupResponseDTO.fromEntity(groupRepository.save(group), true);
  }
}