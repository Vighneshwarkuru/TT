package com.verdictsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CriteriaScoreSummary {
    private Long criteriaId;
    private String criteriaName;
    private double averageScore;
    private List<JudgeScore> judgeScores;
}
