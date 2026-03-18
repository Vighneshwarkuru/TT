package com.verdictsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamSummary {
    private Long id;
    private String teamName;
    private long memberCount;
    private int maxCapacity;
    private Long hackathonId;
}
