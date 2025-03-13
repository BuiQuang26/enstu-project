package vn.quang.enstu.security;

import java.util.Date;

public class ConstantSecurity {
    public static String SECRET_KEY = "kjvnjnvksndfbdsfjnvsdnvjn";
    public static Integer EXPIRES_AT_ACCESS_TOKEN = 20*60*1000;
    public static Integer EXPIRES_AT_REFRESH_TOKEN = 6*60*60*1000;
}
