package com.event.ticketbooking.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Attendee name is required")
    private String attendeeName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String emailId;

    private String phoneNumber;

    @NotBlank(message = "Ticket type is required")
    private String ticketType; // VIP or GENERAL

    @NotNull(message = "Number of tickets is required")
    @Min(value = 1, message = "Number of tickets must be positive")
    private Integer numberOfTickets;

    private Double totalAmount;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "event_id")
    private Event event;

    private LocalDateTime bookingDate;

    @PrePersist
    protected void onCreate() {
        bookingDate = LocalDateTime.now();
    }
}
