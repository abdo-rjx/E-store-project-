package com.estore.billing.repository;

import com.estore.billing.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);
}
