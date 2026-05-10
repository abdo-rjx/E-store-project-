package com.estore.shopping.repository;

import com.estore.shopping.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.product.id = :productId")
    void deleteByProductId(Long productId);
}
