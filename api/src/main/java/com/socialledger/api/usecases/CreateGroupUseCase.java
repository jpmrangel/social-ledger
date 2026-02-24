package com.socialledger.api.usecases;

/*
 * CreateGroupUseCase.java
 * Initializes a new simulation group, attaches the selected members, 
 * and assigns the currently logged-in user as the group's owner.
 */

import java.util.HashSet;
import java.util.List;

import org.springframework.stereotype.Service;

import com.socialledger.api.dtos.GroupResponseDTO;
import com.socialledger.api.models.Group;
import com.socialledger.api.models.User;
import com.socialledger.api.repositories.GroupRepository;
import com.socialledger.api.repositories.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CreateGroupUseCase {
  
  private final GroupRepository groupRepository;
  private final UserRepository userRepository;

  public GroupResponseDTO execute(String name, List<Long> userIds, Long ownerId) {
    if (name == null || name.trim().isEmpty()) {
      throw new IllegalArgumentException("Group name cannot be empty");
    }
    
    List<User> members = userRepository.findAllById(userIds);
    
    Group group = new Group();
    group.setName(name);
    group.setMembers(new HashSet<>(members));

    // The owner is essential for filtering groups on the Dashboard later
    User owner = userRepository.findById(ownerId)
        .orElseThrow(() -> new RuntimeException("Owner not found"));
    group.setOwner(owner);
    
    Group savedGroup = groupRepository.save(group);
    
    return GroupResponseDTO.fromEntity(savedGroup, true);
  }
}