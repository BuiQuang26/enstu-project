package vn.quang.enstu.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.quang.enstu.entities.Tag;
import vn.quang.enstu.entities.User;

import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Long> {
    Boolean existsByTagName(String tagName);
    Optional<Tag> findByTagName(String tagName);
}
