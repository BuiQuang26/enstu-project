package vn.quang.enstu.services;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import vn.quang.enstu.entities.Tag;
import vn.quang.enstu.models.HttpResponse;
import vn.quang.enstu.models.HttpResponseMessage;
import vn.quang.enstu.repositories.TagRepository;

@Service
public class HomeService {

    private final static Logger logger = LogManager.getLogger(HomeService.class);

    @Autowired
    private TagRepository tagRepository;

    public ResponseEntity<?> getTags(int page_number, int page_size) {
        try {
            Sort sort = Sort.by("postsCount").descending();
            Pageable pageable = PageRequest.of(page_number, page_size, sort);
            Page<Tag> tagPage = tagRepository.findAll(pageable);
            return new ResponseEntity<>(new HttpResponse(true, 200,
                    "get tags", tagPage), HttpStatus.OK);
        }catch (Exception e){
            logger.error(e.getMessage());
            return new ResponseEntity<>(new HttpResponseMessage(false, 500,
                    "Server error"), HttpStatus.BAD_GATEWAY);
        }
    }
}

