package com.socialledger.api.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ExpenseResponseDTO {
  private Long id;
  private String description;
  private BigDecimal totalAmount;
  private LocalDateTime createdAt;
  private UserResponseDTO payer;
  private List<ExpenseSplitDTO> splits;
}
