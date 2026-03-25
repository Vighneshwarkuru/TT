package com.verdictsphere.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "hackathon_judges", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"hackathon_id", "judge_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HackathonJudge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hackathon_id", nullable = false)
    private Hackathon hackathon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "judge_id", nullable = false)
    private User judge;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime assignedAt;
}
