package vn.quang.enstu.services;

import org.apache.commons.io.FilenameUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vn.quang.enstu.entities.Comment;
import vn.quang.enstu.entities.EmailConfirmOtp;
import vn.quang.enstu.entities.University;
import vn.quang.enstu.entities.User;
import vn.quang.enstu.helper.storage.S3StorageService;
import vn.quang.enstu.models.*;
import vn.quang.enstu.repositories.*;
import vn.quang.enstu.security.GenerateJWT;
import vn.quang.enstu.helper.mail.MailSenderService;
import vn.quang.enstu.helper.storage.StorageService;

import javax.transaction.Transactional;
import java.io.File;
import java.io.FileOutputStream;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
@Transactional
public class UserService {

    private final static Logger logger = LogManager.getLogger(UserService.class);
    private static final BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();

    @Value("${cloud.aws.s3Domain}")
    private String s3Domain;

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepo;
    private final UniversityRepository universityRepo;
    private final CommentRepository commentRepo;
    private final MailSenderService mailService;
    private final EmailConfirmOtpRepository emailConfirmOtpRepo;
    private final S3StorageService s3StorageService;

    @Autowired
    public UserService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepo,
                       UniversityRepository universityRepo,
                       CommentRepository commentRepo,
                       MailSenderService mailService,
                       EmailConfirmOtpRepository emailConfirmOtpRepo, S3StorageService s3StorageService) {
        this.userRepository = userRepository;
        this.refreshTokenRepo = refreshTokenRepo;
        this.universityRepo = universityRepo;
        this.commentRepo = commentRepo;
        this.mailService = mailService;
        this.emailConfirmOtpRepo = emailConfirmOtpRepo;
        this.s3StorageService = s3StorageService;
    }

    public ResponseEntity<?> register(RequestModelUserRegister user) {
        try {
            if (user.getEmail() == null || user.getEmail().trim().equals(""))
                return new ResponseEntity<>(new HttpResponseMessage(false, 4001,
                        "email invalid"), HttpStatus.BAD_REQUEST);

            if(userRepository.existsByEmail(user.getEmail()))
                return new ResponseEntity<>(new HttpResponseMessage(false, 4002,
                    "email used"), HttpStatus.BAD_REQUEST);

            if (user.getPassword() == null || user.getPassword().trim().equals(""))
                return new ResponseEntity<>(new HttpResponseMessage(false, 4003,
                        "password invalid"), HttpStatus.BAD_REQUEST);

            if (user.getFirstName() == null || user.getFirstName().trim().equals(""))
                return new ResponseEntity<>(new HttpResponseMessage(false, 4004,
                        "first name invalid"), HttpStatus.BAD_REQUEST);

            if (user.getLastName() == null || user.getLastName().trim().equals(""))
                return new ResponseEntity<>(new HttpResponseMessage(false, 4005,
                        "last name invalid"), HttpStatus.BAD_REQUEST);

            EmailConfirmOtp emailConfirmOtp = emailConfirmOtpRepo.findByEmail(user.getEmail()).orElse(null);
            if(emailConfirmOtp == null || !emailConfirmOtp.getOtp().equals(user.getOtp()))
                return new ResponseEntity<>(new HttpResponseMessage(false, 4006,
                    "verify otp failed"),HttpStatus.BAD_REQUEST);

            if(new Date().getTime() > emailConfirmOtp.getExpiresAt().getTime())
                return new ResponseEntity<>(new HttpResponseMessage(false, 4011,
                        "otp expired"), HttpStatus.BAD_REQUEST);

            User userRegister = new User();
            userRegister.setEmail(user.getEmail());
            userRegister.setUsername(user.getEmail());
            userRegister.setFirstName(user.getFirstName());
            userRegister.setLastName(user.getLastName());
            userRegister.setFullName(user.getLastName() + " " + user.getFirstName());
            //enCode password
            userRegister.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
            userRepository.save(userRegister);

            logger.info("register success");

            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "register success", userRegister), HttpStatus.OK);
        }catch (Exception e){
            logger.error("register error: " + e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 501,
                    "NOT IMPLEMENTED"),HttpStatus.NOT_IMPLEMENTED);
        }
    }

    public ResponseEntity<?> getInfo(Long user_id) {
        try {
            User user = userRepository.findById(user_id).orElse(null);
            if(user == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "user not found"), HttpStatus.NOT_FOUND);

            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "get user info", user), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.EXPECTATION_FAILED);
        }
    }

    public ResponseEntity<?> refreshToken(String refresh_token) {
        try {
            if(!refreshTokenRepo.existsByRefreshToken(refresh_token)) return new ResponseEntity<>(new HttpResponseMessage(false, 403,
                    "user was logout"), HttpStatus.FORBIDDEN);

            Long user_id = GenerateJWT.verifyRefreshToken(refresh_token);
            if(user_id == null) return new ResponseEntity<>(new HttpResponseMessage(false, 403,
                    "refresh token invalid"), HttpStatus.FORBIDDEN);

            User user = userRepository.findById(user_id).orElse(null);
            if(user == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "refresh token invalid"), HttpStatus.FORBIDDEN);

            String access_token = GenerateJWT.accessToken(user);
            Map<String, String> data = new HashMap<>();
            data.put("access_token", access_token);
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "refresh token success",data), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.EXPECTATION_FAILED);
        }
    }

    public ResponseEntity<?> logOut(String refresh_token) {
        try {
            refreshTokenRepo.deleteByRefreshToken(refresh_token);
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "logout success", null), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 400,
                    "logout false"), HttpStatus.BAD_REQUEST);
        }
    }

    public ResponseEntity<?> logOutAll(Long user_id) {
        try {
            refreshTokenRepo.deleteAllByUserId(user_id);
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "logout all success", null), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 400,
                    "logout all false"), HttpStatus.BAD_REQUEST);
        }
    }

    public ResponseEntity<?> updateInfo(Long user_id,User user) {
        try{
            User userOld = userRepository.findById(user_id).orElse(null);
            if(userOld == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "user not found"), HttpStatus.NOT_FOUND);

            //last name
            if(user.getLastName() != null && !user.getLastName().trim().equals(""))
                userOld.setLastName(user.getLastName().trim());
            //first name
            if(user.getFirstName() != null && !user.getFirstName().trim().equals("")){
                userOld.setFirstName(user.getFirstName().trim());
            }
            //full name
            userOld.setFullName(userOld.getLastName() + " " + userOld.getFirstName());

            //gender
            if(user.getGender() != null){
                userOld.setGender(user.getGender());
            }

            //address
            if(user.getAddress() != null && !user.getAddress().trim().equals("")) {
                userOld.setAddress(user.getAddress().trim());
            }

            //desc
            if(user.getShortDescYourSelf() != null && !user.getShortDescYourSelf().trim().equals("")){
                userOld.setShortDescYourSelf(user.getShortDescYourSelf());
            }

            //university
            if(user.getUniversityAbbreviation() != null && !user.getUniversityAbbreviation().trim().equals("")){
                University university = universityRepo.findByAbbreviation(user.getUniversityAbbreviation().trim()).orElse(null);
                if(university != null){
                    userOld.setUniversityAbbreviation(user.getUniversityAbbreviation().trim());
                    userOld.setUniversity(university);
                }
            }else {
                userOld.setUniversity(null);
                userOld.setUniversityAbbreviation(null);
            }

            userRepository.save(userOld);
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "update info", userOld), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.BAD_GATEWAY);
        }
    }

    public ResponseEntity<?> updateEmail(Long user_id, ReqBodyUpdateEmail updateEmail) {
        try{
            User userOld = userRepository.findById(user_id).orElse(null);
            if (userOld == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "user not found"), HttpStatus.NOT_FOUND);

            if(updateEmail.getEmail() == null || updateEmail.getEmail().trim().equals(""))
                return new ResponseEntity<>(new HttpResponseMessage(false, 400,
                        "username invalid"), HttpStatus.BAD_REQUEST);

            EmailConfirmOtp emailConfirmOtp = emailConfirmOtpRepo.findByEmail(updateEmail.getEmail()).orElse(null);
            if(emailConfirmOtp == null || !emailConfirmOtp.getOtp().equals(updateEmail.getOtp()))
                return new ResponseEntity<>(new HttpResponseMessage(false, 4006,
                        "verify otp failed"),HttpStatus.BAD_REQUEST);

            if(new Date().getTime() > emailConfirmOtp.getExpiresAt().getTime())
                return new ResponseEntity<>(new HttpResponseMessage(false, 4011,
                        "otp expired"), HttpStatus.BAD_REQUEST);

            userOld.setEmail(updateEmail.getEmail());
            userOld.setUsername(updateEmail.getEmail());
            userRepository.save(userOld);
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "update username success", userOld), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.EXPECTATION_FAILED);
        }
    }

    public ResponseEntity<?> updatePassword(Long user_id, UpdatePassword updatePassword) {
        try {
            User userOld = userRepository.findById(user_id).orElse(null);
            if (userOld == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "user not found"), HttpStatus.NOT_FOUND);

            if(!bCryptPasswordEncoder.matches(updatePassword.getOldPassword(), userOld.getPassword()))
                return new ResponseEntity<>(new HttpResponseMessage(false, 400,
                        "old password incorrect"), HttpStatus.BAD_REQUEST);

            if(updatePassword.getNewPassword() == null || updatePassword.getNewPassword().trim().equals(""))
                return new ResponseEntity<>(new HttpResponseMessage(false, 400,
                        "password invalid"), HttpStatus.BAD_REQUEST);

            userOld.setPassword(bCryptPasswordEncoder.encode(updatePassword.getNewPassword()));
            userRepository.save(userOld);
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "update password success", userOld), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.EXPECTATION_FAILED);
        }

    }

    public ResponseEntity<?> uploadAvatar(Long userID, MultipartFile imageFileUpload) {
        try {
            User user = userRepository.findById(userID).orElse(null);
            if (user == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "user not found"), HttpStatus.NOT_FOUND);

            String oldAvatar = user.getAvatar();

            //check file size
            if(imageFileUpload.getSize() > 2000000) {
                logger.info("file > 2MB");
                return new ResponseEntity<>(new HttpResponseMessage(false, 400,
                        "file > 2MB"), HttpStatus.BAD_REQUEST);
            }
            String fileExtension = FilenameUtils.getExtension(imageFileUpload.getOriginalFilename());

            //create dir avatar in dir public
            String dirAvatar = "avatar/";
//            StorageService.createDirectoryPublic(dirAvatar);
            String fileName = "avatar_" + System.currentTimeMillis() +"." + fileExtension;

            //save avatar
//            StorageService.storeFile(imageFileUpload, fileName, true);
//            user.setAvatar(fileName);
            File newFile = new File(fileName);
            try (FileOutputStream fos = new FileOutputStream(newFile)){
                fos.write(imageFileUpload.getBytes());
            }
            String avatar = s3StorageService.storeFile(newFile,dirAvatar + fileName, true);

            //delete old avatar
            newFile.delete();
            if(oldAvatar != null)
            s3StorageService.deleteFile(oldAvatar.substring(s3Domain.length()));

            user.setAvatar(avatar);
            userRepository.save(user);
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "update avatar success", user), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.EXPECTATION_FAILED);
        }
    }

    public ResponseEntity<?> findAllUsers(int page_number, int page_size) {
        try {
            Pageable pageable = PageRequest.of(page_number, page_size);
            Page<User> userPage = userRepository.findAll(pageable);
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "find all user", userPage), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.EXPECTATION_FAILED);
        }
    }

    public ResponseEntity<?> findUserByFullName(String full_name, int pageNumber, int pageSize) {
        try{
            if(full_name == null || full_name.trim().equals("")) return new ResponseEntity<>(new HttpResponseMessage(false, 400,
                    "query with full-name string invalid"), HttpStatus.BAD_REQUEST);

            Pageable pageable = PageRequest.of(pageNumber, pageSize);
            String fullName = full_name.trim().toLowerCase();
            Page<User> userPage = userRepository.findByFullNameContaining(fullName, pageable);
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "find user by full-name", userPage), HttpStatus.OK);

        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.EXPECTATION_FAILED);
        }
    }

    public ResponseEntity<?> findUserByUniversityCode(String universityAbbreviation,int page_number, int page_size){
        try{
            if( universityAbbreviation == null || universityAbbreviation.trim().equals("")) return new ResponseEntity<>(new HttpResponseMessage(false, 400,
                    "university code string invalid"), HttpStatus.BAD_REQUEST);
            Pageable pageable = PageRequest.of(page_number, page_size);
            Page<User> userPage = userRepository.findByUniversityAbbreviation(universityAbbreviation, pageable);
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "find user by university code", userPage), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.EXPECTATION_FAILED);
        }
    }

    public ResponseEntity<?> deleteUser(Long user_id) {
        try {
            User user = userRepository.findById(user_id).orElse(null);
            if(user == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "user not found"), HttpStatus.NOT_FOUND);
            userRepository.delete(user);

            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "delete user success", null), HttpStatus.OK);

        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.EXPECTATION_FAILED);
        }
    }

    public ResponseEntity<?> findUserById(Long user_id) {
        try {
            User user = userRepository.findById(user_id).orElse(null);
            if(user == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "user not found"), HttpStatus.NOT_FOUND);

            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "get user by ID", user), HttpStatus.OK);

        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.EXPECTATION_FAILED);
        }
    }

    public ResponseEntity<?> getCommentsOfUser(Long user_id, int page_number, int page_size) {
        try {
            User user = userRepository.findById(user_id).orElse(null);
            if(user == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "user not found"), HttpStatus.NOT_FOUND);

            //find comments
            Pageable pageable = PageRequest.of(page_number, page_size);
            Page<Comment> commentPage = commentRepo.findAllByUser(user, pageable);
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "get comments success", commentPage), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.BAD_GATEWAY);
        }
    }

    public ResponseEntity<?> verifyEmailRegister(String email) {
        try {
            User user = userRepository.findByEmail(email).orElse(null);
            if(user != null) return new ResponseEntity<>(new HttpResponseMessage(false, 411, //411 email used
                    "email used"), HttpStatus.BAD_REQUEST);

            //send otp
            String otp = mailService.sendOTP(email);
            if(otp == null) return new ResponseEntity<>(new HttpResponseMessage(false, 412, //412  send email failed
                    "send otp failed"), HttpStatus.BAD_REQUEST);
            //save otp
            EmailConfirmOtp emailConfirmOtp = emailConfirmOtpRepo.findByEmail(email).orElse(null);
            if(emailConfirmOtp == null){
                emailConfirmOtp = new EmailConfirmOtp(email, otp, new Date(System.currentTimeMillis() + 5*60*1000));
            }else {
                emailConfirmOtp.setOtp(otp);
                emailConfirmOtp.setExpiresAt(new Date(System.currentTimeMillis() + 5*60*1000));
            }

            emailConfirmOtpRepo.save(emailConfirmOtp);
            return new ResponseEntity<>(new HttpResponseMessage(true, 200,
                    "otp was send to your email"), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.BAD_GATEWAY);
        }
    }

    public ResponseEntity<?> forgotPassword(ReqBodyForgotPassword forgotPassword) {
        try {
            EmailConfirmOtp emailConfirmOtp = emailConfirmOtpRepo.findByEmail(forgotPassword.getEmail()).orElse(null);
            if(emailConfirmOtp == null || !emailConfirmOtp.getOtp().equals(forgotPassword.getOTP()))
                return new ResponseEntity<>(new HttpResponseMessage(false, 4006,
                        "OTP incorrect"),HttpStatus.BAD_REQUEST);

            if(new Date().getTime() > emailConfirmOtp.getExpiresAt().getTime())
                return new ResponseEntity<>(new HttpResponseMessage(false, 4011,
                        "otp expired"), HttpStatus.BAD_REQUEST);

            User user = userRepository.findByEmail(forgotPassword.getEmail()).orElse(null);
            if(user == null) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "email not exist"), HttpStatus.BAD_REQUEST);

            String newPassword = bCryptPasswordEncoder.encode(forgotPassword.getNewPassword());
            user.setPassword(newPassword);
            userRepository.save(user);
            return new ResponseEntity<>(new HttpResponseMessage(true, 200,
                    "update password success"), HttpStatus.OK);

        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 501,
                    "Not implemented"), HttpStatus.NOT_IMPLEMENTED);
        }
    }

    public ResponseEntity<?> sendOtpEmail(String email) {
        try {
            if(!userRepository.existsByEmail(email)) return new ResponseEntity<>(new HttpResponseMessage(false, 404,
                    "Email is not registered"), HttpStatus.NOT_FOUND);

            //send otp
            String otp = mailService.sendOTP(email);
            if(otp == null) return new ResponseEntity<>(new HttpResponseMessage(false, 412, //412  send email failed
                    "send otp failed"), HttpStatus.BAD_REQUEST);
            //save otp
            EmailConfirmOtp emailConfirmOtp = emailConfirmOtpRepo.findByEmail(email).orElse(null);
            if(emailConfirmOtp == null){
                emailConfirmOtp = new EmailConfirmOtp(email, otp, new Date(System.currentTimeMillis() + 5*60*1000));
            }else {
                emailConfirmOtp.setOtp(otp);
                emailConfirmOtp.setExpiresAt(new Date(System.currentTimeMillis() + 5*60*1000));
            }

            emailConfirmOtpRepo.save(emailConfirmOtp);
            return new ResponseEntity<>(new HttpResponseMessage(true, 200,
                    "otp was send to your email"), HttpStatus.OK);

        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 501,
                    "Not implemented"), HttpStatus.NOT_IMPLEMENTED);
        }
    }
}
