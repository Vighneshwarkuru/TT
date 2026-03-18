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
public class JoinRequestResponse {
    private Long id;
    private Long teamId;
    private String teamName;
    private Long requesterId;
    private String requesterEmail;
    private String requesterFirstName;
    private String requesterLastName;
    private String status;
    private LocalDateTime createdAt;
}
