package com.estore.customer.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "profiles")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String phone;
    private String address;
    private String city;
    private String country;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
