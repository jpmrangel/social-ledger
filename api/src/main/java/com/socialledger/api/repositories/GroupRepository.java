package com.socialledger.api.repositories;

import java.util.Collection;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.socialledger.api.models.Group;

public interface GroupRepository extends JpaRepository<Group, Long> {
  Optional<Group> findByName(String name);

  Collection<Group> findAllByOwnerId(Long currentUserId);
}