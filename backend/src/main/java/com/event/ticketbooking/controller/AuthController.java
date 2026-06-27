package com.event.ticketbooking.controller;

import com.event.ticketbooking.model.User;
import com.event.ticketbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // ---- REGISTER (Local) ----
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String password = body.get("password");

        if (name == null || email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Name, email, and password are required"));
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body(Map.of("error", "An account with this email already exists"));
        }

        boolean isAdmin = email.endsWith("@nexus.edu");

        User user = User.builder()
                .name(name)
                .email(email)
                .password(password) // In production, hash with BCrypt
                .isAdmin(isAdmin)
                .provider("LOCAL")
                .build();

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getEmail(), saved.isAdmin());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of(
                    "id", saved.getId(),
                    "name", saved.getName(),
                    "email", saved.getEmail(),
                    "isAdmin", saved.isAdmin(),
                    "provider", saved.getProvider()
                )
        ));
    }

    // ---- LOGIN (Local) ----
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Account not found"));
        }

        User user = userOpt.get();

        // In production, use BCrypt matches
        if (!password.equals(user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid password"));
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.isAdmin());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of(
                    "id", user.getId(),
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "isAdmin", user.isAdmin(),
                    "provider", user.getProvider()
                )
        ));
    }

    // ---- GOOGLE SIGN-IN ----
    @PostMapping("/google")
    public ResponseEntity<?> googleSignIn(@RequestBody Map<String, String> body) {
        String googleId = body.get("googleId");
        String name = body.get("name");
        String email = body.get("email");

        if (googleId == null || email == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Google ID and email are required"));
        }

        User saved;
        Optional<User> existingByGoogleId = userRepository.findByGoogleId(googleId);
        if (existingByGoogleId.isPresent()) {
            saved = existingByGoogleId.get();
        } else {
            Optional<User> existingByEmail = userRepository.findByEmail(email);
            if (existingByEmail.isPresent()) {
                saved = existingByEmail.get();
                saved.setGoogleId(googleId);
                saved.setProvider("GOOGLE");
                userRepository.save(saved);
            } else {
                boolean isAdmin = email.endsWith("@nexus.edu");
                saved = User.builder()
                        .name(name != null ? name : email.split("@")[0])
                        .email(email)
                        .isAdmin(isAdmin)
                        .provider("GOOGLE")
                        .googleId(googleId)
                        .build();
                userRepository.save(saved);
            }
        }

        String token = jwtUtil.generateToken(saved.getEmail(), saved.isAdmin());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "user", Map.of(
                    "id", saved.getId(),
                    "name", saved.getName(),
                    "email", saved.getEmail(),
                    "isAdmin", saved.isAdmin(),
                    "provider", saved.getProvider()
                )
        ));
    }
}
