package vn.quang.enstu.helper.mail;

import net.bytebuddy.utility.RandomString;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailSenderService {

    private final Logger logger = LogManager.getLogger(MailSenderService.class);
    private final JavaMailSender mailSender;

    public MailSenderService(
            JavaMailSender mailSender
    ) {
        this.mailSender = mailSender;
    }

    public String sendOTP(String email) {
        try {
            logger.info("Sending OTP...");
            String otp = RandomString.make(8);

            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(email);
            mailMessage.setSubject("Verifier your email  for Enstu App");
            mailMessage.setText("### OTP for verify email ###\n" +
                                "OTP expires in 5 minutes. \n" +
                                "---------------------------\n" +
                                "OTP code:  " + otp + "\n" +
                                "---------------------------\n" +
                                "*** Wellcome to  Enstu ***");

            mailSender.send(mailMessage);

            return otp;
        }catch (Exception e){
            logger.error(e.getMessage());
            return null;
        }
    }

}
