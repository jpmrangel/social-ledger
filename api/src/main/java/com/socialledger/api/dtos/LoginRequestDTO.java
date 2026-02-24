package com.socialledger.api.dtos;

import lombok.Data;

@Data
public class LoginRequestDTO {
  private String email;
  private String password;
}
