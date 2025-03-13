package vn.quang.enstu.repositories;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.quang.enstu.entities.Post;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findAllByTagName(String tagName, Pageable pageable);

    @Query("SELECT post FROM Post post WHERE post.title LIKE %:title%")
    List<Post> findByTitleContains(@Param("title") String title);

    @Query("SELECT post FROM Post post WHERE post.content LIKE %:content%")
    List<Post> findByContentContains(@Param("content") String content);
}
