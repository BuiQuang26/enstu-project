package vn.quang.enstu.controllers;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.quang.enstu.services.HomeService;

@RestController
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api")
public class HomeController {

    @Autowired
    private HomeService homeService;

    @GetMapping(value = "/tags", produces = "application/json")
    public ResponseEntity<?> getTags(int page_number, int page_size){
        return homeService.getTags(page_number, page_size);
    }

    // TODO: 5/9/2022 api report post

}
