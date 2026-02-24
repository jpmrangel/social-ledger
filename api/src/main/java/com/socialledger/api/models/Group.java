package com.socialledger.api.models;

import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;
import java.util.List;

@Entity
@Table(name = "social_groups")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class Group {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  @ManyToOne
  @JoinColumn(name = "owner_id")
  private User owner;

  @ManyToMany
  @JoinTable(
    name = "group_members",
    joinColumns = @JoinColumn(name = "group_id"),
    inverseJoinColumns = @JoinColumn(name = "user_id")
  )
  private Set<User> members = new HashSet<>();

  @OneToMany(mappedBy = "group", cascade = CascadeType.ALL)
  private List<Expense> expenses;
}