package vn.quang.enstu.helper.storage;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;

@Service
public class S3StorageService {
    @Value("${cloud.aws.bucketName}")
    private String bucketName;

    @Autowired
    private AmazonS3 s3Client;

    public String storeFile(File file, String fileName, Boolean filePublic){
        try {
            s3Client.putObject(bucketName, fileName, file);
            if(filePublic) s3Client.setObjectAcl(bucketName, fileName, CannedAccessControlList.PublicRead);
            return s3Client.getUrl(bucketName, fileName).toString();
        }catch (Exception e){
            throw new RuntimeException(e.getMessage());
        }
    }

    public void deleteFile( String fileName){
        try {
            s3Client.deleteObject(bucketName, fileName);
        }catch (Exception e){
            throw new RuntimeException(e.getMessage());
        }
    }
}
