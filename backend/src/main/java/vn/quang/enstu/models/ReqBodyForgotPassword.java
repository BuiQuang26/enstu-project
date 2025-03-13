package vn.quang.enstu.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
public class ReqBodyForgotPassword {
    private String OTP;
    private String email;
    private String newPassword;
}
