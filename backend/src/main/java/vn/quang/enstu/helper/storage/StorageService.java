package vn.quang.enstu.helper.storage;

import org.springframework.web.multipart.MultipartFile;
import vn.quang.enstu.services.StorageConstant;

import java.io.File;
import java.io.FileOutputStream;

public class StorageService {

    public static void storeFile(MultipartFile file, String filename, Boolean filePublic){

        String dirPubic = StorageConstant.publicDirectory;
        if(!filePublic) dirPubic = StorageConstant.uploadInternalDirectory;

        filename = dirPubic + "/" + filename;

        try {
            File newFile = new File(filename);
            try (FileOutputStream fos = new FileOutputStream(newFile)){
                fos.write(file.getBytes());
            }
            newFile = null;
        }catch (Exception e){
            throw new RuntimeException(e.getMessage());
        }
    }

    public static void deleteFileInPublicDir(String filename){
        try {
            File file = new File(StorageConstant.publicDirectory + "/" + filename);
            file.delete();
        }catch (Exception e){
            throw new RuntimeException("delete old avatar failed : " + e.getMessage());
        }
    }

    public static Boolean createDirectoryPublic(String directory){
            try {
                File dir = new File(StorageConstant.publicDirectory + directory);
                if(!dir.exists()) return dir.mkdirs();
                return false;
            }catch (Exception e){
                throw new RuntimeException(e.getMessage());
            }
    }

}
