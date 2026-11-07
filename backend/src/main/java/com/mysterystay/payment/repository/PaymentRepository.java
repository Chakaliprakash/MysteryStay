package com.mysterystay.payment.repository;

import com.mysterystay.payment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByPaymentReference(String paymentReference);

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    Optional<Payment> findByBookingId(Long bookingId);

    List<Payment> findAllByBookingIdOrderByCreatedAtDesc(Long bookingId);
}
