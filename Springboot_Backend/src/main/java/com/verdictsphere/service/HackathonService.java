package com.verdictsphere.service;

import com.verdictsphere.dto.HackathonRequest;
import com.verdictsphere.dto.HackathonResponse;
import com.verdictsphere.entity.Hackathon;
import com.verdictsphere.entity.User;
import com.verdictsphere.exception.EntityNotFoundException;
import com.verdictsphere.exception.InvalidDateRangeException;
import com.verdictsphere.repository.HackathonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HackathonService {

    private final HackathonRepository hackathonRepository;
    private final AuditService auditService;

    @Transactional
    public HackathonResponse createHackathon(HackathonRequest req, User admin) {
        validateDates(req);

        Hackathon hackathon = Hackathon.builder()
                .name(req.getName())
                .description(req.getDescription())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .registrationDeadline(req.getRegistrationDeadline())
                .isActive(req.isActive())
                .createdBy(admin)
                .build();

        Hackathon saved = hackathonRepository.save(hackathon);
        return toResponse(saved);
    }

    public List<HackathonResponse> getAllHackathons() {
        return hackathonRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public HackathonResponse updateHackathon(Long id, HackathonRequest req, User admin) {
        Hackathon hackathon = hackathonRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Hackathon not found with id: " + id));

        validateDates(req);

        hackathon.setName(req.getName());
        hackathon.setDescription(req.getDescription());
        hackathon.setStartDate(req.getStartDate());
        hackathon.setEndDate(req.getEndDate());
        hackathon.setRegistrationDeadline(req.getRegistrationDeadline());
        hackathon.setActive(req.isActive());

        Hackathon saved = hackathonRepository.save(hackathon);

        auditService.log(admin.getId(), "UPDATE_HACKATHON", "HACKATHON", saved.getId(),
                "Updated hackathon: " + saved.getName(), null);

        return toResponse(saved);
    }

    @Transactional
    public void deleteHackathon(Long id, User admin) {
        Hackathon hackathon = hackathonRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Hackathon not found with id: " + id));

        hackathonRepository.delete(hackathon);

        auditService.log(admin.getId(), "DELETE_HACKATHON", "HACKATHON", id,
                "Deleted hackathon: " + hackathon.getName(), null);
    }

    public List<HackathonResponse> getActiveHackathons() {
        return hackathonRepository.findByIsActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private void validateDates(HackathonRequest req) {
        if (req.getStartDate() != null && req.getEndDate() != null
                && req.getEndDate().isBefore(req.getStartDate())) {
            throw new InvalidDateRangeException("End date must be after start date");
        }
    }

    private HackathonResponse toResponse(Hackathon h) {
        return HackathonResponse.builder()
                .id(h.getId())
                .name(h.getName())
                .description(h.getDescription())
                .startDate(h.getStartDate())
                .endDate(h.getEndDate())
                .registrationDeadline(h.getRegistrationDeadline())
                .isActive(h.isActive())
                .createdAt(h.getCreatedAt())
                .build();
    }
}
