package com.socialledger.api.dtos;

import java.math.BigDecimal;
import java.util.Map;

import lombok.Data;

@Data
public class ExpenseRequestDTO {
  private String description;
  private BigDecimal totalAmount;
  private Long payerId;
  private Long groupId;
  private Map<Long, BigDecimal> splits; 
}