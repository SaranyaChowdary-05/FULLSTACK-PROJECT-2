package com.event.ticketbooking.config;

import com.event.ticketbooking.model.Event;
import com.event.ticketbooking.model.User;
import com.event.ticketbooking.repository.EventRepository;
import com.event.ticketbooking.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner loadData(EventRepository eventRepository, UserRepository userRepository) {
        return args -> {
            // Seed default users
            if (userRepository.count() == 0) {
                userRepository.save(User.builder()
                        .name("Admin")
                        .email("admin@nexus.edu")
                        .password("123")
                        .isAdmin(true)
                        .provider("LOCAL")
                        .build());
                userRepository.save(User.builder()
                        .name("Standard User")
                        .email("user@gmail.com")
                        .password("123")
                        .isAdmin(false)
                        .provider("LOCAL")
                        .build());
                System.out.println("✅ Default users seeded (admin@nexus.edu / user@gmail.com)");
            }
            if (eventRepository.count() == 0) {
                eventRepository.saveAll(java.util.List.of(
                    Event.builder()
                        .eventName("Tech Symposium 2026")
                        .description("A deep dive into the future of technology, from AI to Quantum Computing.")
                        .eventDate(LocalDateTime.now().plusDays(15))
                        .venue("Main Auditorium")
                        .category("Tech")
                        .priceGeneral(150.0).priceVIP(300.0)
                        .totalTickets(200)
                        .availableTicketsGeneral(150).availableTicketsVIP(50)
                        .imageUrl("https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80")
                        .build(),
                    Event.builder()
                        .eventName("Cultural Fest 2026")
                        .description("Celebrating diversity through music, dance, and art from across the globe.")
                        .eventDate(LocalDateTime.now().plusDays(30))
                        .venue("Campus Open Air Theatre")
                        .category("Arts")
                        .priceGeneral(50.0).priceVIP(120.0)
                        .totalTickets(500)
                        .availableTicketsGeneral(400).availableTicketsVIP(100)
                        .imageUrl("https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&q=80")
                        .build(),
                    Event.builder()
                        .eventName("AI & Future Tech Summit")
                        .description("Join industry leaders to discuss the impact of Generative AI on our society.")
                        .eventDate(LocalDateTime.now().plusDays(45))
                        .venue("Innovation Hub")
                        .category("Tech")
                        .priceGeneral(200.0).priceVIP(450.0)
                        .totalTickets(100)
                        .availableTicketsGeneral(80).availableTicketsVIP(20)
                        .imageUrl("https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=1200&q=80")
                        .build(),
                    Event.builder()
                        .eventName("Global Business Hacks")
                        .description("Learn the secrets of successful entrepreneurs and scale your business.")
                        .eventDate(LocalDateTime.now().plusDays(12))
                        .venue("Business Center")
                        .category("Business")
                        .priceGeneral(120.0).priceVIP(250.0)
                        .totalTickets(200)
                        .availableTicketsGeneral(160).availableTicketsVIP(40)
                        .imageUrl("https://images.unsplash.com/photo-1556761175-5973dd0f32d7?w=1200&q=80")
                        .build(),
                    Event.builder()
                        .eventName("Engineering Expo")
                        .description("Showcasing the latest breakthroughs in mechanical and civil engineering.")
                        .eventDate(LocalDateTime.now().plusDays(20))
                        .venue("Engineering Quad")
                        .category("Engineering")
                        .priceGeneral(0.0).priceVIP(50.0)
                        .totalTickets(600)
                        .availableTicketsGeneral(500).availableTicketsVIP(100)
                        .imageUrl("https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80")
                        .build(),
                    Event.builder()
                        .eventName("Medical Science Fair")
                        .description("Explore the wonders of biology and the future of healthcare technology.")
                        .eventDate(LocalDateTime.now().plusDays(25))
                        .venue("Health Sciences Building")
                        .category("Medicine")
                        .priceGeneral(25.0).priceVIP(75.0)
                        .totalTickets(300)
                        .availableTicketsGeneral(250).availableTicketsVIP(50)
                        .imageUrl("https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80")
                        .build(),
                    Event.builder()
                        .eventName("Law & Ethics Conference")
                        .description("A critical look at justice, digital privacy, and international law.")
                        .eventDate(LocalDateTime.now().plusDays(40))
                        .venue("Moot Court")
                        .category("Law")
                        .priceGeneral(100.0).priceVIP(200.0)
                        .totalTickets(120)
                        .availableTicketsGeneral(100).availableTicketsVIP(20)
                        .imageUrl("https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=1200&q=80")
                        .build(),
                    Event.builder()
                        .eventName("Music Showcase")
                        .description("An evening of classical and contemporary music featuring local talent.")
                        .eventDate(LocalDateTime.now().plusDays(18))
                        .venue("Symphony Hall")
                        .category("Music")
                        .priceGeneral(40.0).priceVIP(100.0)
                        .totalTickets(300)
                        .availableTicketsGeneral(250).availableTicketsVIP(50)
                        .imageUrl("https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1200&q=80")
                        .build(),
                    Event.builder()
                        .eventName("Sustainability Challenge")
                        .description("Finding green solutions for a better tomorrow through collaboration.")
                        .eventDate(LocalDateTime.now().plusDays(8))
                        .venue("Eco Center")
                        .category("Environment")
                        .priceGeneral(10.0).priceVIP(30.0)
                        .totalTickets(200)
                        .availableTicketsGeneral(180).availableTicketsVIP(20)
                        .imageUrl("https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&q=80")
                        .build(),
                    Event.builder()
                        .eventName("Startup Pitch Night")
                        .description("Witness the next generation of unicorns pitch their ideas to VCs.")
                        .eventDate(LocalDateTime.now().plusDays(50))
                        .venue("Incubator Lab")
                        .category("Business")
                        .priceGeneral(30.0).priceVIP(80.0)
                        .totalTickets(150)
                        .availableTicketsGeneral(120).availableTicketsVIP(30)
                        .imageUrl("https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80")
                        .build(),
                    Event.builder()
                        .eventName("Great Literature Festival")
                        .description("Celebrating the written word with readings and workshops from top authors.")
                        .eventDate(LocalDateTime.now().plusDays(28))
                        .venue("Main Library")
                        .category("Literature")
                        .priceGeneral(45.0).priceVIP(90.0)
                        .totalTickets(200)
                        .availableTicketsGeneral(160).availableTicketsVIP(40)
                        .imageUrl("https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80")
                        .build()
                ));
                System.out.println("✅ 11 Events seeded successfully!");
            }
        };
    }
}
