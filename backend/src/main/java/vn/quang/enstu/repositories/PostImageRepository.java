package vn.quang.enstu.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.quang.enstu.entities.PostImages;
import vn.quang.enstu.entities.User;

public interface PostImageRepository extends JpaRepository<PostImages, Long> {
}
