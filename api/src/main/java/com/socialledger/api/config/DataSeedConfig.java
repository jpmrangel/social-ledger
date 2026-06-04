package com.socialledger.api.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.socialledger.api.models.User;
import com.socialledger.api.repositories.UserRepository;

@Configuration
public class DataSeedConfig {

  @Bean
  public CommandLineRunner seedGuestUser(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
    return args -> {
      String guestEmail = "guest@email.com";

      if (userRepository.findByEmail(guestEmail).isEmpty()) {
        User guest = new User();
        guest.setName("Guest");
        guest.setEmail(guestEmail);
        guest.setPasswordHash(passwordEncoder.encode("guest1234"));
        userRepository.save(guest);
      }
    };
  }
}
