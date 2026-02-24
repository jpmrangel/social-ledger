package com.socialledger.api.dtos;

import java.util.List;

import lombok.Data;

@Data
public class GroupRequestDTO {
  private String name;
  private List<Long> userIds;
}
