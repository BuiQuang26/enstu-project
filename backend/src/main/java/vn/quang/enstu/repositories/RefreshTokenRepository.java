package vn.quang.enstu.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.quang.enstu.entities.RefreshToken;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByRefreshToken(String refresh_token);
    Boolean existsByRefreshToken(String refresh_token);
    void deleteByRefreshToken(String refresh_token);
    void deleteAllByUserId(Long user_id);
}
