package vn.quang.enstu.services;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.quang.enstu.entities.*;
import vn.quang.enstu.helper.storage.S3StorageService;
import vn.quang.enstu.models.HttpResponse;
import vn.quang.enstu.models.HttpResponseMessage;
import vn.quang.enstu.repositories.*;
import vn.quang.enstu.helper.storage.StorageService;

import java.io.File;
import java.io.FileOutputStream;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PostService {

    @Value("${cloud.aws.s3Domain}")
    private String s3Domain;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostImageRepository postImageRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private LikeRepository likeRepo;

    @Autowired
    private CommentRepository commentRepo;

    @Autowired
    private S3StorageService s3StorageService;

    private final static Logger logger = LogManager.getLogger(PostService.class);

    public ResponseEntity<?> createPost(Long user_id, Post post, MultipartFile[] fileImages) {
        try {
            if(post == null) return new ResponseEntity<>(new HttpResponseMessage(false, 400,
                    "post content invalid"), HttpStatus.BAD_REQUEST);

            User user = userRepository.findById(user_id).orElse(null);
            if(user == null) return new ResponseEntity<>(new HttpResponseMessage(false, 400,
                    "access user not found"), HttpStatus.BAD_REQUEST);

            if(post.getTagName() == null || post.getTagName().equals("")) return new ResponseEntity<>(new HttpResponseMessage(false,
                    400, "tag is not found"), HttpStatus.BAD_REQUEST);

            Tag tag = tagRepository.findByTagName(post.getTagName()).orElse(null);
            if(tag == null){
                tag = new Tag(post.getTagName());
                tagRepository.save(tag);
            }

            post.setTag(tag);
            post.setUser(user);

            if(fileImages != null){
                //save images
                List<PostImages> postImages = new ArrayList<>();
                String filename = null;
                for (MultipartFile fileImage : fileImages) {
                    filename = "images_" + System.currentTimeMillis() + "_" + fileImage.getOriginalFilename();
                    File newFile = new File(filename);
                    try (FileOutputStream fos = new FileOutputStream(newFile)){
                        fos.write(fileImage.getBytes());
                    }
//                    StorageService.storeFile(fileImage, filename, true);
                    String fileUrl = s3StorageService.storeFile(newFile, "post_images/" + filename, true);
                    postImages.add(new PostImages(fileUrl, post));
                    newFile.delete();
                }
                postImageRepository.saveAll(postImages);
            }

            postRepository.save(post);
            Tag tag1 = tagRepository.findByTagName(post.getTagName()).orElse(null);
            if(tag1 != null) {
                tag1.setPostsCount(tag1.getPostsCount() + 1);
                tagRepository.save(tag1);
            }

            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "post up success", post), HttpStatus.OK);

        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.BAD_GATEWAY);
        }
    }

    //update post
    public ResponseEntity<?> updatePost( Long user_id, Long post_id, Post postReq){
        try {
            Post post = postRepository.findById(post_id).orElse(null);
            if(post == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "post not found"), HttpStatus.NOT_FOUND);

            if(!Objects.equals(post.getUser().getId(), user_id)) return new ResponseEntity<>(new HttpResponseMessage(false, 400,
                    "access user not post owner"), HttpStatus.BAD_REQUEST);

            //update title
            if(postReq.getTitle() != null && !postReq.getTitle().trim().equals("")){
                post.setTitle(postReq.getTitle().trim());
            }

            //update tag
            if(postReq.getTagName() != null && !post.getTagName().equals(postReq.getTagName())){
                Tag oldTag = tagRepository.findByTagName(post.getTagName()).orElse(null);
                if(oldTag != null && oldTag.getPostsCount() > 0){
                    oldTag.setPostsCount(oldTag.getPostsCount() - 1);
                    tagRepository.save(oldTag);
                }
                Tag tag = tagRepository.findByTagName(postReq.getTagName()).orElse(null);
                if(tag == null) {
                    tag = new Tag(postReq.getTagName());
                    tagRepository.save(tag);
                }
                post.setTag(tag);
                post.setTagName(postReq.getTagName());
            }

            //update content
            if(postReq.getContent() != null && !postReq.getContent().trim().equals("")){
                post.setContent(postReq.getContent());
            }

            postRepository.save(post);

            //update post count
            Tag tag1 = tagRepository.findByTagName(post.getTagName()).orElse(null);
            if(tag1 != null) {
                tag1.setPostsCount(tag1.getPostsCount() + 1);
                tagRepository.save(tag1);
            }
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "update post", post), HttpStatus.OK);

        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.BAD_GATEWAY);
        }
    }

    public ResponseEntity<?> getAll(int page_number, int page_size) {
        try {
            Sort sort = Sort.by("createAt").descending();
            Pageable pageable = PageRequest.of(page_number, page_size, sort);
            Page<Post> posts = postRepository.findAll(pageable);
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "get posts",posts), HttpStatus.OK);

        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.BAD_GATEWAY);
        }
    }

    public ResponseEntity<?> getPostById(Long postID) {
        try {
            Post post = postRepository.findById(postID).orElse(null);
            if(post == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "post not found"), HttpStatus.NOT_FOUND);
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "get post by id", post), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.BAD_GATEWAY);
        }
    }

    public ResponseEntity<?> deletePost(Long user_id, Long post_id) {
        try {
            Post post = postRepository.findById(post_id).orElse(null);
            if(post == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "post not found"), HttpStatus.NOT_FOUND);

            if(!Objects.equals(post.getUser().getId(), user_id)) return new ResponseEntity<>(new HttpResponseMessage(false, 400,
                    "users access not post owner"), HttpStatus.BAD_REQUEST);

            List<PostImages> imagesList = post.getImagesList();
            imagesList.forEach(postImages -> {
                s3StorageService.deleteFile(postImages.getImage().substring(s3Domain.length()));
            });

            post.setUser(null);

            //remove liked users
            List<User> userList = post.getLikes().stream().map(user -> {
                user.unlikedPost(post);
                return  user;
            }).collect(Collectors.toList());
            userRepository.saveAll(userList);

            Tag tag = post.getTag();
            postRepository.delete(post);

            //update post count
            if(tag.getPostsCount() > 0)
            tag.setPostsCount(tag.getPostsCount() - 1);
            tagRepository.save(tag);
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "delete post success", null), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.BAD_GATEWAY);
        }
    }

    public ResponseEntity<?> deletePost(Long post_id) {
        try {
            Post post = postRepository.findById(post_id).orElse(null);
            if(post == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "post not found"), HttpStatus.NOT_FOUND);

            List<PostImages> imagesList = post.getImagesList();
            imagesList.forEach(postImages -> {
                StorageService.deleteFileInPublicDir(postImages.getImage());
            });

            post.setUser(null);

            //remove liked users
            List<User> userList = post.getLikes().stream().map(user -> {
                user.unlikedPost(post);
                return  user;
            }).collect(Collectors.toList());
            userRepository.saveAll(userList);

            Tag tag = post.getTag();
            postRepository.delete(post);

            //update post count
            if(tag.getPostsCount() > 0)
                tag.setPostsCount(tag.getPostsCount() - 1);
            tagRepository.save(tag);
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "delete post success", null), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.BAD_GATEWAY);
        }
    }

    public ResponseEntity<?> getAllPostByTagName(String tagName, int page_number, int page_size) {
        try {
            Pageable pageable = PageRequest.of(page_number, page_size);
            Page<Post> posts = postRepository.findAllByTagName(tagName, pageable);


            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "get post by tag name", posts), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.BAD_GATEWAY);
        }
    }

    public ResponseEntity<?> searchPost(String text) {
        try {
            List<Post> postsTitle = postRepository.findByTitleContains(text);
            List<Post> postsContent = postRepository.findByContentContains(text);

            Map<Object,Object> data = new HashMap<>();
            data.put("title", postsTitle);
            data.put("content", postsContent);
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "search post", data), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.BAD_GATEWAY);
        }
    }

    public ResponseEntity<?> checkLiked(Long user_id, Long post_id){
        try {
            User user = userRepository.findById(user_id).orElse(null);
            if(user == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "user not found"), HttpStatus.NOT_FOUND);

            Post post = postRepository.findById(post_id).orElse(null);
            if(post == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "post not found"), HttpStatus.NOT_FOUND);

            if(user.getLikedPosts().contains(post)) return new ResponseEntity<>(new HttpResponseMessage(true, 200,
                    "post liked"), HttpStatus.OK);

            return new ResponseEntity<>(new HttpResponseMessage(false, 404, "post not liked"), HttpStatus.NOT_FOUND);

        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.BAD_GATEWAY);
        }
    }

    public ResponseEntity<?> likePost(Long user_id, Long post_id) {
        try {
            User user = userRepository.findById(user_id).orElse(null);
            if(user == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "user not found"), HttpStatus.NOT_FOUND);

            Post post = postRepository.findById(post_id).orElse(null);
            if(post == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "post not found"), HttpStatus.NOT_FOUND);

            if(user.getLikedPosts().contains(post)) return new ResponseEntity<>(new HttpResponseMessage(false, 4000,
                    "post liked"), HttpStatus.BAD_REQUEST);

            user.likePost(post);
            userRepository.save(user);
            post.setLikes_count(post.getLikes_count() + 1);
            postRepository.save(post);
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "like post", post), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.BAD_GATEWAY);
        }
    }

    public ResponseEntity<?> unlikePost(Long user_id, Long post_id) {
        try {
            User user = userRepository.findById(user_id).orElse(null);
            if(user == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "user not found"), HttpStatus.NOT_FOUND);

            Post post = postRepository.findById(post_id).orElse(null);
            if(post == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "post not found"), HttpStatus.NOT_FOUND);

            if(!user.getLikedPosts().contains(post)) return new ResponseEntity<>(new HttpResponseMessage(false, 400,
                    "post not liked"), HttpStatus.BAD_REQUEST);

            user.unlikedPost(post);
            userRepository.save(user);
            if(post.getLikes_count() > 0)
            post.setLikes_count(post.getLikes_count() - 1);
            postRepository.save(post);

            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "like post", post), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.BAD_GATEWAY);
        }
    }

    public ResponseEntity<?> getLikedPost(Long user_id) {
        try {
            User user = userRepository.findById(user_id).orElse(null);
            if(user == null) return new ResponseEntity<>(new HttpResponseMessage(false, 400,
                    "access user not found"), HttpStatus.BAD_REQUEST);

            Set<Post> posts = user.getLikedPosts();
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "liked post", posts), HttpStatus.OK);

        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.BAD_GATEWAY);
        }
    }

    public ResponseEntity<?> getUsersLiked(Long post_id) {
        try {
            Post post = postRepository.findById(post_id).orElse(null);
            if(post == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "post not found"), HttpStatus.OK);
            Set<User> userList = post.getLikes();
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "the user gets to like the post", userList), HttpStatus.OK);

        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.BAD_GATEWAY);
        }
    }

    public ResponseEntity<?> createComment(Comment comment, Long post_id, Long user_id) {
        try {
            Post post = postRepository.findById(post_id).orElse(null);
            if(post == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "post not found"), HttpStatus.NOT_FOUND);

            User commentUsers = userRepository.findById(user_id).orElse(null);
            if(commentUsers == null) return new ResponseEntity<>(new HttpResponseMessage(false, 400,
                    "comment users not found"), HttpStatus.BAD_REQUEST);

            comment.setPost(post);
            comment.setUser(commentUsers);
            commentRepo.save(comment);

            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "users comment success", comment), HttpStatus.OK);

        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.BAD_GATEWAY);
        }
    }

    public ResponseEntity<?> getCommentsOfPost(Long post_id, int page_number, int page_size) {
        try {
            Post post = postRepository.findById(post_id).orElse(null);
            if(post == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "post not found"), HttpStatus.NOT_FOUND);

            //find comments
            Sort sort = Sort.by("createAt").descending();
            Pageable pageable = PageRequest.of(page_number, page_size, sort);
            Page<Comment> commentPage = commentRepo.findAllByPost(post, pageable);
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "get comments success", commentPage), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.BAD_GATEWAY);
        }
    }

    //delete comment
    //user -> delete
    public ResponseEntity<?> deleteComment(Long user_id, Long comment_id) {
        try {
            Comment comment = commentRepo.findById(comment_id).orElse(null);
            if(comment == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "comment not found"), HttpStatus.NOT_FOUND);

            if(!comment.getUser().getId().equals(user_id)) return new ResponseEntity<>(new HttpResponseMessage(false, 403,
                    "user not comment owner"), HttpStatus.FORBIDDEN);

            commentRepo.delete(comment);
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "comment delete success", null), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.BAD_GATEWAY);
        }
    }
    //admin -> delete
    public ResponseEntity<?> deleteComment(Long comment_id) {
        try {
            Comment comment = commentRepo.findById(comment_id).orElse(null);
            if(comment == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "comment not found"), HttpStatus.NOT_FOUND);

            commentRepo.delete(comment);
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "comment delete success", null), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.BAD_GATEWAY);
        }
    }

    public ResponseEntity<?> updateComments(Long user_id,Long comment_id, Comment commentReq) {
        try {
            Comment comment = commentRepo.findById(comment_id).orElse(null);
            if(comment == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "comment not found"), HttpStatus.NOT_FOUND);

            if(!comment.getUser().getId().equals(user_id)) return new ResponseEntity<>(new HttpResponseMessage(false, 403,
                    "user not comment owner"), HttpStatus.FORBIDDEN);

            if(commentReq.getTextContent() == null || commentReq.getTextContent().trim().equals(""))
                return new ResponseEntity<>(new HttpResponseMessage(false, 400,
                        "text content invalid"), HttpStatus.BAD_REQUEST);

            comment.setTextContent(commentReq.getTextContent().trim());
            commentRepo.save(comment);
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "update comment", comment), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.BAD_GATEWAY);
        }
    }

    public ResponseEntity<?> getPostByUserId(Long userID, Long user_id_token) {
        try {
            User user = userRepository.findById(userID).orElse(null);
            if(user == null) return new ResponseEntity<>(new HttpResponseMessage(false, 400,
                    "access user not found"), HttpStatus.BAD_REQUEST);
            List<Post> postList = user.getPosts();
            Map<Object, Object> map = new HashMap<>();
            map.put("posts", postList);
            map.put("owner", userID.equals(user_id_token));
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "get posts",map), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.BAD_GATEWAY);
        }
    }
}
