package com.verdictsphere.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateTeamRequest {
    @NotBlank(message = "Team name is required")
    private String teamName;

    @NotNull(message = "Hackathon ID is required")
    private Long hackathonId;

    private String projectTitle;
    private String abstractContent;
    private String extraQuestion1;
    private String extraQuestion2;
    private String extraQuestion3;
}
