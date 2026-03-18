package com.verdictsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CriteriaResponse {
    private Long id;
    private Long hackathonId;
    private String name;
    private String description;
    private int maxScore;
    private BigDecimal weight;
    private int displayOrder;
}
