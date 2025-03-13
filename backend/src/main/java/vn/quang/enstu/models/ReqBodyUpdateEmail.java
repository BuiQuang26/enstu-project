package vn.quang.enstu.models;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
public class ReqBodyUpdateEmail {
    private String otp;
    private String email;
}
