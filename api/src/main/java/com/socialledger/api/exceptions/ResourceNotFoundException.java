package com.socialledger.api.exceptions;

/*
 * ResourceNotFoundException.java
 * A custom runtime exception thrown whenever the application 
 * attempts to fetch a database entity (User, Group, Expense) that does not exist.
 */

public class ResourceNotFoundException extends RuntimeException {
  public ResourceNotFoundException(String message) {
    super(message);
  }
}
