package com.event.ticketbooking.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Column(unique = true)
    private String email;

    private String password;

    @Builder.Default
    private boolean isAdmin = false;

    // AUTH PROVIDER: "LOCAL" for email/password, "GOOGLE" for Google Sign-In
    @Builder.Default
    private String provider = "LOCAL";

    // Google OAuth subject ID (null for local accounts)
    private String googleId;
}
