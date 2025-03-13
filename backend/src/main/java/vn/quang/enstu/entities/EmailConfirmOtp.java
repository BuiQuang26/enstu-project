package vn.quang.enstu.entities;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Table(name = "email_confirm_token")
@Getter @Setter @NoArgsConstructor
public class EmailConfirmOtp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "otp", nullable = false)
    private String otp;

    @Column(name = "expires_at", nullable = false)
    private Date expiresAt;

    public EmailConfirmOtp(String email, String otp, Date expiresAt) {
        this.email = email;
        this.otp = otp;
        this.expiresAt = expiresAt;
    }
}
