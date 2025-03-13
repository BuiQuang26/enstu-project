package vn.quang.enstu.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.*;

@Entity
@Table(name = "user")
@Getter @Setter @NoArgsConstructor @ToString
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @Column(name = "first_name")
    private String firstName;

    @NotNull
    @Column(name = "last_name")
    private String lastName;

    @NotNull
    @Column(name = "full_name")
    private String fullName;

    @Column(name = "gender")
    private Integer gender = 0; //0: male , 1: female, 2: other

    @Column(name = "university_abbreviation")
    private String universityAbbreviation;

    @JoinColumn(name = "university")
    @ManyToOne(fetch = FetchType.EAGER)
    private University university;

    @Column(name = "address")
    private String address;

    @Column(name = "avatar")
    private String avatar;

    @NotNull
    @Column(name = "email", unique = true)
    private String email;

    @NotNull
    @Column(name = "username", unique = true)
    private String username;

    @Column(name = "short_describe_yourself ", length = 1024)
    private String shortDescYourSelf;

    @NotNull
    @Column(name = "password")
    private String password;

    @Column(name = "authorities")
    private String authorities = "USER";

    @JsonIgnore
    @OneToMany(mappedBy = "user", cascade = {CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH})
    @ToString.Exclude
    private List<Post> posts;

    // liked post ------------------------error--------------------------------------!!!
    @JsonIgnore
    @ManyToMany(cascade = {CascadeType.MERGE, CascadeType.PERSIST})
    @ToString.Exclude
    private Set<Post> likedPosts = new HashSet<>();

    public void likePost(Post post){
        likedPosts.add(post);
    }

    public void unlikedPost(Post post){
        likedPosts.remove(post);
    }
    //--------------------------------------------------------------------------------!!!

    @CreationTimestamp
    private Date createAt;

    @UpdateTimestamp
    private Date updateAt;
}
