package com.socialledger.api.dtos;

import java.util.List;

import com.socialledger.api.models.Group;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class GroupResponseDTO {
  private Long id;
  private String name;
  private List<UserResponseDTO> members;

  public static GroupResponseDTO fromEntity(Group group, boolean includeMembers) {
    var builder = GroupResponseDTO.builder()
        .id(group.getId())
        .name(group.getName());

    if (includeMembers && group.getMembers() != null) {
      builder.members(group.getMembers().stream()
          .map(UserResponseDTO::fromEntity)
          .toList());
    }

    return builder.build();
  }
}
