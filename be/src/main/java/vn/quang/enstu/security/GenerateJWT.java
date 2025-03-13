package vn.quang.enstu.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import vn.quang.enstu.entities.User;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static vn.quang.enstu.security.ConstantSecurity.*;

public class GenerateJWT {

    private final static Logger logger = LogManager.getLogger(GenerateJWT.class);

    public static String accessToken(User user){
        Algorithm algorithm = Algorithm.HMAC256(SECRET_KEY);
        return JWT.create()
                .withSubject(user.getEmail())
                .withClaim("user_id", user.getId())
                .withClaim("authorities", user.getAuthorities())
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRES_AT_ACCESS_TOKEN))
                .sign(algorithm);
    }

    public static String refreshToken(User user){
        Algorithm algorithm = Algorithm.HMAC256(SECRET_KEY);
        return JWT.create()
                .withSubject(user.getEmail())
                .withClaim("user_id", user.getId())
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRES_AT_REFRESH_TOKEN))
                .sign(algorithm);
    }

    public static Map<String,Object> verifyAccessToken(String access_token){
        try {
            Map<String,Object> map = new HashMap<>();

            //decode jwt
            DecodedJWT jwt = JWT.decode(access_token);
            if(jwt.getExpiresAt().before(new Date())){
                map.put("expired", new Date());
                return map;
            }

            //verifier token
            Algorithm algorithm = Algorithm.HMAC256(SECRET_KEY);
            JWTVerifier verifier = JWT.require(algorithm).build();
            DecodedJWT decodedJWT = verifier.verify(access_token);
            String email = decodedJWT.getSubject();
            Long user_id = decodedJWT.getClaim("user_id").asLong();
            String authorities = decodedJWT.getClaim("authorities").asString();
            map.put("email", email);
            map.put("user_id", user_id);
            map.put("authorities", authorities);
            return map;
        }catch (Exception e){
            throw new RuntimeException(e.getMessage());
        }
    }

    public static Long verifyRefreshToken(String refresh_token){
        try {
            Algorithm algorithm = Algorithm.HMAC256(SECRET_KEY);
            JWTVerifier verifier = JWT.require(algorithm).build();
            DecodedJWT decodedJWT = verifier.verify(refresh_token);
            return decodedJWT.getClaim("user_id").asLong();
        }catch (Exception e){
            logger.error(e.getMessage());
            return null;
        }
    }

}
