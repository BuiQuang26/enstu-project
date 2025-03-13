package vn.quang.enstu.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.quang.enstu.entities.EmailConfirmOtp;

import java.util.Optional;

@Repository
public interface EmailConfirmOtpRepository extends JpaRepository<EmailConfirmOtp, Long> {
    Optional<EmailConfirmOtp> findByEmail(String email);
}
