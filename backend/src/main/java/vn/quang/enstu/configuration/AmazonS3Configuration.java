package vn.quang.enstu.configuration;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AmazonS3Configuration {
    @Value("${cloud.aws.accessKey}")
    private String accessKey;

    @Value("${cloud.aws.secretKey}")
    private String secretKey;

    @Value("${cloud.aws.clientRegion}")
    private String clientRegion;

    @Bean
    public AmazonS3 generateS3Client(){
        AWSCredentials credentials = new
                BasicAWSCredentials(accessKey, secretKey);
        return AmazonS3ClientBuilder.standard().withRegion(clientRegion)
                .withCredentials(
                        new AWSStaticCredentialsProvider(credentials)).build();

    }

}
