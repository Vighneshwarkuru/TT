package com.verdictsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationResponse {
    private Long id;
    private Long hackathonId;
    private Long judgeId;
    private Long teamId;
    private Long criteriaId;
    private String criteriaName;
    private int score;
    private int maxScore;
    private String remarks;
    private LocalDateTime evaluatedAt;
}
