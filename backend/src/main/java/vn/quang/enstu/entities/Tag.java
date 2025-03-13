package vn.quang.enstu.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "tag")
@Getter @Setter @NoArgsConstructor
public class Tag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @Column(name = "tag_name", unique = true)
    private String tagName;

    @Column(name = "posts_count")
    private Integer postsCount = 0;

    @JsonIgnore
    @OneToMany(mappedBy = "tag", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<Post> postList;

    @CreationTimestamp
    private Date createAt;

    public Tag(String tagName) {
        this.tagName = tagName;
    }
}
