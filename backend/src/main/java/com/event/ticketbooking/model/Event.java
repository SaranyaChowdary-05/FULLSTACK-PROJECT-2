package com.event.ticketbooking.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String eventName;
    private String description;
    private LocalDateTime eventDate;
    private String venue;
    private String category; // Literature, Tech, Music, etc.
    
    private Double priceGeneral;
    private Double priceVIP;
    
    private Integer totalTickets;
    private Integer availableTicketsGeneral;
    private Integer availableTicketsVIP;

    @Column(length = 2000)
    private String imageUrl;
}
