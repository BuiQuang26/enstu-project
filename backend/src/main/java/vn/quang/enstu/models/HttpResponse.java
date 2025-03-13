package vn.quang.enstu.models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class HttpResponse {
    private Boolean success;
    private Integer status_code;
    private String message;
    private Object data;
}
