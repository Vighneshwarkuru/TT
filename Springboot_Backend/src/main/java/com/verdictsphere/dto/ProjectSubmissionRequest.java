package com.verdictsphere.dto;

import lombok.Data;

@Data
public class ProjectSubmissionRequest {
    private String githubUrl;
    private String demoUrl;
    private String presentationUrl;
}
