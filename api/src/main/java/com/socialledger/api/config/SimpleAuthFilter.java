package com.socialledger.api.config;

/*
 * SimpleAuthFilter.java
 * Custom filter that intercepts API requests, extracts the X-User-Id 
 * header, and injects the user into the Spring Security context for stateless auth.
 */

import java.io.IOException;
import java.util.Collections;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.socialledger.api.repositories.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SimpleAuthFilter extends OncePerRequestFilter {

  private final UserRepository userRepository;

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
          throws ServletException, IOException {
      
    String path = request.getRequestURI();
    
    // Only process authentication for API endpoints
    if (path.startsWith("/api/")) {
      String userIdStr = request.getHeader("X-User-Id");

      if (userIdStr != null && SecurityContextHolder.getContext().getAuthentication() == null) {
        try {
          Long userId = Long.valueOf(userIdStr);
          
          // If the user exists, authenticate them for this request
          userRepository.findById(userId).ifPresent(user -> {
              UsernamePasswordAuthenticationToken authToken = 
                new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());
              SecurityContextHolder.getContext().setAuthentication(authToken);
          });
        } catch (NumberFormatException e) {
          // Silently ignore invalid ID formats; Spring Security will handle the rejection
        }
      }
    }

    // Continue the request chain
    filterChain.doFilter(request, response);
  }
}