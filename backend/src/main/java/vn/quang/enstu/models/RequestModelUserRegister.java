package vn.quang.enstu.models;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
public class RequestModelUserRegister {
    private String otp;
    private String email;
    private String password;
    private String lastName;
    private String firstName;
}
