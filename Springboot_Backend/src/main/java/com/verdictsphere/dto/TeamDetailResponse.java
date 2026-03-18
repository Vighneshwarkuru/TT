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
public class TeamDetailResponse {
    private Long id;
    private String teamName;
    private Long hackathonId;
    private UserResponse createdBy;
    private String acceptanceStatus;
    private long memberCount;
    private String githubUrl;
    private String demoUrl;
    private String presentationUrl;
    private LocalDateTime createdAt;
}
