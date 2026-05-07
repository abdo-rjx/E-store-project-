package com.estore.shopping.repository;

import com.estore.shopping.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
}
