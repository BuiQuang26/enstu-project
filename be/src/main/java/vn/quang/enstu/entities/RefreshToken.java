package vn.quang.enstu.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotNull;

@Entity
@Table(name = "refresh_token")
@Getter @Setter @NoArgsConstructor
public class  RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @Column(name = "user_id")
    private Long userId;

    @NotNull
    @Column(name = "refresh_token", unique = true)
    private String refreshToken;

    public RefreshToken(Long user_id, String refreshToken) {
        this.userId = user_id;
        this.refreshToken = refreshToken;
    }
}
