package com.verdictsphere.dto;

import lombok.Data;
import java.util.List;

@Data
public class AiFeedbackRequest {
    private String teamName;
    private List<EvaluationResponse> evaluations;
}
