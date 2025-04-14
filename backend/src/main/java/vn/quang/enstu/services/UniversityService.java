package vn.quang.enstu.services;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.quang.enstu.entities.University;
import vn.quang.enstu.models.HttpResponse;
import vn.quang.enstu.models.HttpResponseMessage;
import vn.quang.enstu.repositories.UniversityRepository;

@Service
@Transactional
public class UniversityService {

    private final static Logger logger = LogManager.getLogger(UniversityService.class);
    private final UniversityRepository universityRepository;

    public UniversityService(
            UniversityRepository universityRepository
    ) {
        this.universityRepository = universityRepository;
    }

    public ResponseEntity<?> create(University university) {
        try {
            if(university.getAbbreviation() == null || university.getAbbreviation().trim().equals("")) return new ResponseEntity<>(new HttpResponseMessage(false, 400,
                    "university code is invalid"), HttpStatus.BAD_REQUEST);

            if(university.getName() == null || university.getName().trim().equals("")) return new ResponseEntity<>(new HttpResponseMessage(false, 400,
                    "university name is invalid"), HttpStatus.BAD_REQUEST);

            universityRepository.save(university);
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "create university success", university), HttpStatus.OK);

        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.BAD_GATEWAY);
        }
    }

    @Transactional(readOnly = true)
    public ResponseEntity<?> getAll() {
        try {
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "get universities", universityRepository.findAll()), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.BAD_GATEWAY);
        }
    }
}
