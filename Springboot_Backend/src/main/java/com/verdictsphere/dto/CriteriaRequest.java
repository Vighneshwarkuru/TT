package com.verdictsphere.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CriteriaRequest {
    private Long hackathonId;
    private String name;
    private String description;
    private int maxScore;
    private BigDecimal weight;
    private int displayOrder;
}
