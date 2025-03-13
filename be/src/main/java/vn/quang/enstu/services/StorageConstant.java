package vn.quang.enstu.services;

import java.nio.file.Paths;

public class StorageConstant {
    public static String publicDirectory = Paths.get("src\\main\\resources\\static\\public").toAbsolutePath().toString();
    public static String uploadInternalDirectory = Paths.get("upload").toAbsolutePath().toString();
}
