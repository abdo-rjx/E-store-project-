package com.estore.inventory.entity;

import com.estore.catalog.entity.Product;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inventories")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer quantity;

    @OneToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
}
