package vn.quang.enstu.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.quang.enstu.entities.Comment;
import vn.quang.enstu.entities.Post;
import vn.quang.enstu.services.PostService;

import javax.servlet.ServletRequest;

@RestController
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api/posts")
public class PostController {

    private final static Logger logger = LogManager.getLogger(PostController.class);

    @Autowired
    private PostService postService;

    @PostMapping(value = "/up_with_images", produces = "application/json")
    public ResponseEntity<?> createPostContentAndImages(@RequestParam("content") String jsonPost,
                                        @RequestParam("images") MultipartFile[] fileImages,
                                        ServletRequest request) {
        Long user_id = (Long) request.getAttribute("user_id");

        //json string to Post object
        ObjectMapper objectMapper = new ObjectMapper();
        Post post = null;
        try {
            post = objectMapper.readValue(jsonPost, Post.class);
        } catch (JsonProcessingException e) {
            logger.error(e.getMessage());
        }

        return postService.createPost(user_id, post, fileImages);
    }

    @PostMapping(value = "up_no_images", produces = "application/json")
    public ResponseEntity<?> createPostContent(@RequestBody Post post, ServletRequest request) {
        Long user_id = (Long) request.getAttribute("user_id");
        return postService.createPost(user_id, post, null);
    }

    @PutMapping(value = "/{post_id}", produces = "application/json")
    public ResponseEntity<?> updatePost(@PathVariable Long post_id, @RequestBody Post post, ServletRequest request){
        Long user_id = (Long) request.getAttribute("user_id");
        return postService.updatePost(user_id, post_id, post);
    }

    //delete post
    @DeleteMapping(value = "/{post_id}/delete", produces = "application/json")
    public ResponseEntity<?> deletePost(@PathVariable Long post_id, ServletRequest request){
        Long user_id = (Long) request.getAttribute("user_id");
        return postService.deletePost(user_id, post_id);
    }

    @GetMapping(value = "/all", produces = "application/json")
    public ResponseEntity<?> getAllPost(int page_number, int page_size){
        return postService.getAll(page_number, page_size);
    }

    @GetMapping(value = "/{postID}", produces = "application/json")
    public ResponseEntity<?> getPostById(@PathVariable Long postID){
        return postService.getPostById(postID);
    }

    @GetMapping(value = "/me" , produces = "application/json")
    public ResponseEntity<?> getPostByMe(ServletRequest request){
        Long user_id = (Long) request.getAttribute("user_id");
        return postService.getPostByUserId(user_id, null);
    }

    //get posts by user id
    @GetMapping(value = "/user/{userID}" , produces = "application/json")
    public ResponseEntity<?> getPostByUserId(@PathVariable Long userID, ServletRequest request){
        Long user_id_token = (Long) request.getAttribute("user_id");
        return postService.getPostByUserId(userID, user_id_token);
    }

    //get post by tag
    @GetMapping(value = "/tag/{tagName}", produces = "application/json")
    public ResponseEntity<?> getPostByTagName(@PathVariable String tagName, int page_number, int page_size){
        return postService.getAllPostByTagName(tagName, page_number, page_size);
    }

    //search post
    @GetMapping(value = "/search", produces = "application/json")
    public ResponseEntity<?> searchPost(@RequestParam("v") String text){
        return postService.searchPost(text);
    }


    //like -----------------------------------------------------------------------------------------------------------
    //likes post
    @PutMapping(value = "/{post_id}/like", produces = "application/json")
    public ResponseEntity<?> likePost(@PathVariable Long post_id, ServletRequest request){
        Long user_id = (Long) request.getAttribute("user_id");
        return postService.likePost(user_id, post_id);
    }

    //unlike post
    @PutMapping(value = "/{post_id}/unlike", produces = "application/json")
    public ResponseEntity<?> unlikePost(@PathVariable Long post_id, ServletRequest request){
        Long user_id = (Long) request.getAttribute("user_id");
        return postService.unlikePost(user_id, post_id);
    }

    //get post liked
    @GetMapping(value = "/liked", produces = "application/json")
    public ResponseEntity<?> getLikedPost(ServletRequest request){
        Long user_id = (Long) request.getAttribute("user_id");
        return postService.getLikedPost(user_id);
    }

    //get user liked
    @GetMapping(value = "/{post_id}/users/liked", produces = "application/json")
    public ResponseEntity<?> getUserLiked(@PathVariable Long post_id){
        return postService.getUsersLiked(post_id);
    }

    @GetMapping(value = "/{post_id}/liked/check", produces = "application/json")
    public ResponseEntity<?> checkLikedPost(@PathVariable Long post_id, ServletRequest request){
        Long user_id = (Long) request.getAttribute("user_id");
        return postService.checkLiked(user_id, post_id);
    }

    //like end------------------------------------------------------------------------------------------------------------------

    //Comment ---------------------------------------------------------------------------------------------------------------

    //create comment
    @PostMapping(value = "/{post_id}/comment", produces = "application/json")
    public ResponseEntity<?> createComment(@RequestBody Comment comment,
                                           @PathVariable Long post_id,
                                           ServletRequest request){
        Long user_id = (Long) request.getAttribute("user_id");
        return postService.createComment(comment, post_id, user_id);
    }

    @PutMapping(value = "/comments/{comment_id}", produces = "application/json")
    public ResponseEntity<?> updateComment(@RequestBody Comment comment,@PathVariable Long comment_id,  ServletRequest request){
        Long user_id = (Long) request.getAttribute("user_id");
        return postService.updateComments(user_id, comment_id, comment);
    }

    //delete comment
    @DeleteMapping(value = "/comment/{comment_id}", produces = "application/json")
    public ResponseEntity<?> deleteComment(@PathVariable Long comment_id, ServletRequest request){
        Long user_id = (Long) request.getAttribute("user_id");
        return postService.deleteComment( user_id, comment_id);
    }

    //get list comment of a post
    @GetMapping(value = "/{post_id}/comments", produces = "application/json")
    public ResponseEntity<?> getComments(@PathVariable Long post_id, int page_number, int page_size){
        return postService.getCommentsOfPost(post_id, page_number, page_size);
    }

    //comment end ----------------------------------------------------------------------------------------------------------

}
