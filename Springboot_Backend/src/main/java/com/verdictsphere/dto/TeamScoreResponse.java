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
public class TeamScoreResponse {
    private Long teamId;
    private String teamName;
    private List<CriteriaScoreSummary> criteriaScores;
}
