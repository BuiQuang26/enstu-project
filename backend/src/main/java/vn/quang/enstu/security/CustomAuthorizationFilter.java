package vn.quang.enstu.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import vn.quang.enstu.models.HttpResponseMessage;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;

import static org.springframework.http.HttpHeaders.AUTHORIZATION;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

public class CustomAuthorizationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        if(request.getServletPath().equals("/api/users/register") ||
                request.getServletPath().equals("/api/users/login") ||
                request.getServletPath().equals("/api/users/refresh-token") ||
                request.getServletPath().startsWith("/api/users/email/otp/") ||
                request.getServletPath().startsWith("/api/users/register/verify-email/")
        ){
            filterChain.doFilter(request, response);
        }else {
            if(request.getHeader(AUTHORIZATION) == null || !request.getHeader(AUTHORIZATION).startsWith("Bearer ")){
                filterChain.doFilter(request, response);
            }else {
                try {
                    String access_token = request.getHeader(AUTHORIZATION).substring("Bearer ".length());
                    //verify token
                    Map<String, ?> dataMap =  GenerateJWT.verifyAccessToken(access_token);
                    if(dataMap.get("expired") == null){
                        String email = (String) dataMap.get("email");
                        Long user_id = (Long) dataMap.get("user_id");
                        String authorities = (String) dataMap.get("authorities");
                        request.setAttribute("user_id", user_id);
                        request.setAttribute("email", email);
                        request.setAttribute("authorities", authorities);
                        Collection<SimpleGrantedAuthority> grantedAuthorities = new ArrayList<>();
                        grantedAuthorities.add(new SimpleGrantedAuthority(authorities));
                        UsernamePasswordAuthenticationToken authenticationToken =
                                new UsernamePasswordAuthenticationToken(email, null, grantedAuthorities);
                        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                        filterChain.doFilter(request, response);
                    }else {
                        response.setContentType(APPLICATION_JSON_VALUE);
                        response.setStatus(401);
                        new ObjectMapper().writeValue(response.getOutputStream(), new HttpResponseMessage(false, 401,
                                "The Token has expired"));
                    }
                }catch (Exception e){
                    logger.error(e.getMessage());
                    filterChain.doFilter(request, response);
                }
            }
        }
    }
}
