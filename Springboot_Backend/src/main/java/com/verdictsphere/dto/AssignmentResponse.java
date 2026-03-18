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
public class AssignmentResponse {
    private Long id;
    private Long hackathonId;
    private Long judgeId;
    private String judgeEmail;
    private Long teamId;
    private String teamName;
    private LocalDateTime assignedAt;
}
