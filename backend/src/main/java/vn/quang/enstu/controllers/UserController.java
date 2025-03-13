package vn.quang.enstu.controllers;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.quang.enstu.entities.User;
import vn.quang.enstu.models.ReqBodyForgotPassword;
import vn.quang.enstu.models.ReqBodyUpdateEmail;
import vn.quang.enstu.models.RequestModelUserRegister;
import vn.quang.enstu.models.UpdatePassword;
import vn.quang.enstu.helper.mail.MailSenderService;
import vn.quang.enstu.services.UserService;

import javax.servlet.ServletRequest;

@RestController
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private MailSenderService mailService;

    //register
    @PostMapping(value = "/register", produces = "application/json")
    public ResponseEntity<?> register(@RequestBody RequestModelUserRegister userRegister){
        return userService.register(userRegister);
    }

    //verifier email
    @PostMapping(value = "/register/verify-email/{email}", produces = "application/json")
    public ResponseEntity<?> verifyEmailRegister(@PathVariable String email){
        return userService.verifyEmailRegister(email);
    }

    //Send otp email
    @PostMapping(value = "/email/otp/{email}", produces = "application/json")
    public ResponseEntity<?> sendOtpEmail(@PathVariable String email){
        return userService.sendOtpEmail(email);
    }

    //refresh token
    @PostMapping(value = "/refresh-token", produces = "application/json")
    public ResponseEntity<?> refreshToken(@RequestHeader String refresh_token){
        return userService.refreshToken(refresh_token);
    }

    //log out
    @PostMapping(value = "/logout", produces = "application/json")
    public ResponseEntity<?> logOut(@RequestHeader String refresh_token){
        return userService.logOut(refresh_token);
    }

    //log out
    @PostMapping(value = "/logout-all")
    public ResponseEntity<?> logOutAll(ServletRequest request){
        Long user_id = (Long) request.getAttribute("user_id");
        return userService.logOutAll(user_id);
    }

    //update info
    @PutMapping(value = "/info", produces = "application/json")
    public ResponseEntity<?> updateInfo(@RequestBody User user, ServletRequest request){
        Long user_id =(Long) request.getAttribute("user_id");
        return userService.updateInfo(user_id, user);
    }

    //update username
    @PutMapping(value = "/email", produces = "application/json")
    public ResponseEntity<?> updateUsername(@RequestBody ReqBodyUpdateEmail updateEmail, ServletRequest request){
        Long user_id =(Long) request.getAttribute("user_id");
        return userService.updateEmail(user_id, updateEmail);
    }

    //update password
    @PutMapping(value = "/password", produces = "application/json")
    public ResponseEntity<?> updatePassword(@RequestBody UpdatePassword updatePassword, ServletRequest request){
        Long user_id =(Long) request.getAttribute("user_id");
        return userService.updatePassword(user_id, updatePassword);
    }

    //Forgot password
    @PostMapping(value = "/forgot-password", produces = "application/json")
    public ResponseEntity<?> forgotPassword(@RequestBody ReqBodyForgotPassword forgotPassword){
        return userService.forgotPassword(forgotPassword);
    }

    //update avatar
    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("avatar") MultipartFile fileUpload , ServletRequest request) {
        Long user_id = (Long) request.getAttribute("user_id");
        return userService.uploadAvatar(user_id, fileUpload);
    }

    //get info
    @GetMapping("/info")
    public ResponseEntity<?> getInfo(ServletRequest request){
        Long user_id = (Long) request.getAttribute("user_id");
        return userService.getInfo(user_id);
    }

    //find all user
    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers(int page_number, int page_size){
        return userService.findAllUsers(page_number, page_size);
    }

    //find user by username
    @GetMapping("/full-name/{full_name}")
    public ResponseEntity<?> findUserByFullName(@PathVariable String full_name,
                                                int page_number, int page_size){
        return userService.findUserByFullName(full_name, page_number, page_size);
    }

    //find user by id
    @GetMapping("/id/{user_id}")
    public ResponseEntity<?> findUserById(@PathVariable Long user_id){
        return userService.findUserById(user_id);
    }

    //find user by university code
    @GetMapping("/university-abbreviation/{university_abbreviation}")
    public ResponseEntity<?> findUserByUniversityCode(@PathVariable String university_abbreviation,
                                                      int page_number, int page_size){
        return userService.findUserByUniversityCode(university_abbreviation, page_number, page_size);
    }

    //get comments
    //get list comment of a user
    @GetMapping(value = "/comments", produces = "application/json")
    public ResponseEntity<?> getCommentsOfUser(ServletRequest request, int page_number, int page_size){
        Long user_id = (Long) request.getAttribute("user_id");
        return userService.getCommentsOfUser(user_id, page_number, page_size);
    }
}
