package com.verdictsphere.dto;

import lombok.Data;

import java.util.List;

@Data
public class EvaluationRequest {
    private Long teamId;
    private Long hackathonId;
    private List<CriteriaScore> scores;
}
