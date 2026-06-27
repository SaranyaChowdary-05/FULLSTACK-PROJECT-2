package com.event.ticketbooking.controller;

import com.event.ticketbooking.model.Booking;
import com.event.ticketbooking.model.Event;
import com.event.ticketbooking.repository.BookingRepository;
import com.event.ticketbooking.repository.EventRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public java.util.List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@Valid @RequestBody Booking booking) {
        if (booking.getEvent() == null || booking.getEvent().getId() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Event selection is mandatory"));
        }

        Optional<Event> eventOpt = eventRepository.findById(booking.getEvent().getId());
        if (eventOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Event not found"));
        }

        Event event = eventOpt.get();
        String ticketType = booking.getTicketType();
        int requested = booking.getNumberOfTickets();

        if ("VIP".equalsIgnoreCase(ticketType)) {
            if (requested > event.getAvailableTicketsVIP()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Not enough VIP tickets available"));
            }
            booking.setTotalAmount(requested * event.getPriceVIP());
            event.setAvailableTicketsVIP(event.getAvailableTicketsVIP() - requested);
        } else {
            if (requested > event.getAvailableTicketsGeneral()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Not enough General tickets available"));
            }
            booking.setTotalAmount(requested * event.getPriceGeneral());
            event.setAvailableTicketsGeneral(event.getAvailableTicketsGeneral() - requested);
        }

        // Save event and booking
        eventRepository.save(event);
        Booking savedBooking = bookingRepository.save(booking);
        savedBooking.setEvent(event);

        // Broadcast the updated event so all clients instantly reflect the new ticket count
        messagingTemplate.convertAndSend("/topic/events", event);

        // Broadcast a real-time notification
        String notificationMessage = booking.getAttendeeName() + " just booked " + requested + " " + ticketType + " ticket(s) for " + event.getEventName() + "!";
        messagingTemplate.convertAndSend("/topic/notifications", Map.of(
            "message", notificationMessage,
            "eventId", event.getId(),
            "timestamp", System.currentTimeMillis()
        ));

        return ResponseEntity.ok(savedBooking);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return errors;
    }
}
