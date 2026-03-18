package com.verdictsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JudgeStat {
    private Long judgeId;
    private String judgeEmail;
    private int evaluatedCount;
    private int totalAssigned;
}
