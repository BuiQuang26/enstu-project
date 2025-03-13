package vn.quang.enstu.controllers;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.quang.enstu.entities.University;
import vn.quang.enstu.repositories.UniversityRepository;
import vn.quang.enstu.repositories.UserRepository;
import vn.quang.enstu.services.UniversityService;
import vn.quang.enstu.services.UserService;

@RestController
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/api")
public class UniversityController {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private UserService userService;

    @Autowired
    private UniversityService universityService;

    @Autowired
    private UniversityRepository universityRepository;

    @PostMapping(value = "/admin/university", produces = "application/json")
    public ResponseEntity<?> createUniversity(@RequestBody University university){
        return universityService.create(university);
    }

    @GetMapping(value = "/university/all")
    public ResponseEntity<?> getAllUniversity(){
        return universityService.getAll();
    }

}
