package com.verdictsphere.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class HackathonRequest {
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate registrationDeadline;
    private boolean isActive;
}
