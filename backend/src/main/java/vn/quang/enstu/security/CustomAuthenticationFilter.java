package vn.quang.enstu.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import vn.quang.enstu.entities.RefreshToken;
import vn.quang.enstu.entities.User;
import vn.quang.enstu.models.HttpResponse;
import vn.quang.enstu.models.HttpResponseMessage;
import vn.quang.enstu.repositories.RefreshTokenRepository;
import vn.quang.enstu.repositories.UserRepository;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

public class CustomAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    private final static Logger logger = LogManager.getLogger(CustomAuthenticationFilter.class);
    private Map<String,String> userMap = null;

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public CustomAuthenticationFilter(AuthenticationManager authenticationManager, UserRepository userRepository, RefreshTokenRepository refreshTokenRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }


    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {
        try {
            InputStream inputStream = request.getInputStream();
            ObjectMapper objectMapper = new ObjectMapper();
            userMap = objectMapper.readValue(inputStream, Map.class);
        } catch (IOException e) {
            e.printStackTrace();
        }

        if(userMap == null || userMap.get("username") == null || userMap.get("password") == null){
            response.setStatus(400);
            response.setContentType(APPLICATION_JSON_VALUE);
            try {
                new ObjectMapper().writeValue(response.getOutputStream(), new HttpResponseMessage(false,
                        400,"username or password incorrect"));
            } catch (IOException e) {
                e.printStackTrace();
            }
            return null;
        }

        return authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(userMap.get("username"), userMap.get("password")));
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException, ServletException {
        User user = userRepository.findByUsername(userMap.get("username")).orElse(null);

        //generate token
        assert user != null;
        String access_token = GenerateJWT.accessToken(user);
        String refresh_token = GenerateJWT.refreshToken(user);

        Map<String,String> data = new HashMap<>();
        data.put("access_token", access_token);
        data.put("refresh_token", refresh_token);

        response.setStatus(200);
        response.setContentType(APPLICATION_JSON_VALUE);
        new ObjectMapper().writeValue(response.getOutputStream(), new HttpResponse(true, 200,
                "login success", data));

        refreshTokenRepository.save(new RefreshToken(user.getId(),refresh_token));
        logger.info("login success : " + user);
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, AuthenticationException failed) throws IOException, ServletException {
        response.setStatus(400);
        response.setContentType(APPLICATION_JSON_VALUE);
        new ObjectMapper().writeValue(response.getOutputStream(), new HttpResponseMessage(false, 400,
                "login failed : username or password incorrect"));
        logger.info("login failed");
    }
}
