package com.verdictsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamDetailResponse {
    private Long id;
    private String teamName;
    private String projectTitle;
    private String abstractContent;
    private String extraQuestion1;
    private String extraQuestion2;
    private String extraQuestion3;
    private Long hackathonId;
    private UserResponse createdBy;
    private String acceptanceStatus;
    private long memberCount;
    private String githubUrl;
    private String demoUrl;
    private String presentationUrl;
    private List<UserResponse> members;
    private LocalDateTime createdAt;
}
