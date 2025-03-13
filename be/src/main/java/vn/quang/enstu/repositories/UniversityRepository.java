package vn.quang.enstu.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.quang.enstu.entities.Like;
import vn.quang.enstu.entities.University;

import java.util.Optional;

public interface UniversityRepository extends JpaRepository<University, Long> {
    Optional<University> findByAbbreviation(String abbreviation);
}
