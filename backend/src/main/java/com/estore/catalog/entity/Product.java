package com.estore.catalog.entity;

import com.estore.inventory.entity.Inventory;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "products")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double price;

    private String imageUrl;

    @Column(length = 2000)
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private Inventory inventory;
}
