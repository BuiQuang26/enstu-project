package vn.quang.enstu.models;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
public class UpdatePassword {
    private String oldPassword;
    private String newPassword;
}
