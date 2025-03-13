package vn.quang.enstu.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import vn.quang.enstu.entities.Comment;
import vn.quang.enstu.entities.Post;
import vn.quang.enstu.entities.User;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findAllByUser(User user, Pageable pageable);
    Page<Comment> findAllByPost(Post post, Pageable pageable);
}
