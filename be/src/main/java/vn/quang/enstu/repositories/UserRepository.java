package vn.quang.enstu.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.quang.enstu.entities.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Page<User> findByFullNameContaining(String fullName, Pageable pageable);
    Page<User> findByUniversityAbbreviation(String universityAbbreviation, Pageable pageable);
    Boolean existsByEmail(String email);

}
