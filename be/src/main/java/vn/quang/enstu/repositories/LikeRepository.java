package vn.quang.enstu.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.PathVariable;
import vn.quang.enstu.entities.Like;
import vn.quang.enstu.entities.User;

import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {
}
