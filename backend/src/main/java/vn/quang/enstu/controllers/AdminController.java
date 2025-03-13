package vn.quang.enstu.controllers;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.quang.enstu.services.PostService;
import vn.quang.enstu.services.UserService;

import javax.servlet.ServletRequest;

@RestController
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private PostService postService;

    //delete comment
    @DeleteMapping(value = "/comment/{comment_id}", produces = "application/json")
    public ResponseEntity<?> deleteComment(@PathVariable Long comment_id, ServletRequest request){
        return postService.deleteComment(comment_id);
    }

    //delete post
    @DeleteMapping(value = "/post/{post_id}/delete", produces = "application/json")
    public ResponseEntity<?> deletePost(@PathVariable Long post_id, ServletRequest request){
        return postService.deletePost(post_id);
    }

}
