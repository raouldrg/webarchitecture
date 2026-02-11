package com.ecoimpact.tracker.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "activity_templates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String defaultUnit;

    @Column(nullable = false)
    private Double co2Factor;

    @Column(columnDefinition = "TEXT")
    private String source;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "activity_type_id", nullable = false)
    private ActivityType activityType;

    @OneToMany(mappedBy = "activityTemplate", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonIgnore
    private List<Entry> entries = new ArrayList<>();
}
