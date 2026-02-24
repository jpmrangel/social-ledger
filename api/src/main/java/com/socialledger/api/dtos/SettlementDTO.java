package com.socialledger.api.dtos;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SettlementDTO {
  private Long fromUserId;
  private String fromUserName;
  private Long toUserId;
  private String toUserName;
  private BigDecimal amount;
}
