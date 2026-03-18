package com.verdictsphere.dto;

import lombok.Data;

@Data
public class JoinTeamRequest {
    private Long teamId;
    private String teamName;
}
