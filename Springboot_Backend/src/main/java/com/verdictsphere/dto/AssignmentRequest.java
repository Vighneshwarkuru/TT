package com.verdictsphere.dto;

import lombok.Data;

@Data
public class AssignmentRequest {
    private Long hackathonId;
    private Long judgeId;
    private Long teamId;
}
