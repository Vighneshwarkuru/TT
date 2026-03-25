package com.verdictsphere.service;

import com.verdictsphere.dto.HackathonRequest;
import com.verdictsphere.dto.HackathonResponse;
import com.verdictsphere.dto.UserResponse;
import com.verdictsphere.entity.Hackathon;
import com.verdictsphere.entity.HackathonJudge;
import com.verdictsphere.entity.User;
import com.verdictsphere.exception.EntityNotFoundException;
import com.verdictsphere.exception.InvalidDateRangeException;
import com.verdictsphere.repository.HackathonJudgeRepository;
import com.verdictsphere.repository.HackathonRepository;
import com.verdictsphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HackathonService {

    private final HackathonRepository hackathonRepository;
    private final HackathonJudgeRepository hackathonJudgeRepository;
    private final UserRepository userRepository;
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
                .extraQuestion1Label(req.getExtraQuestion1Label())
                .extraQuestion2Label(req.getExtraQuestion2Label())
                .extraQuestion3Label(req.getExtraQuestion3Label())
                .createdBy(admin)
                .build();

        Hackathon saved = hackathonRepository.save(hackathon);
        
        auditService.log(admin.getId(), "CREATE_HACKATHON", "HACKATHON", saved.getId(),
                "Created hackathon: " + saved.getName(), null);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
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
        hackathon.setExtraQuestion1Label(req.getExtraQuestion1Label());
        hackathon.setExtraQuestion2Label(req.getExtraQuestion2Label());
        hackathon.setExtraQuestion3Label(req.getExtraQuestion3Label());

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

    @Transactional(readOnly = true)
    public List<HackathonResponse> getActiveHackathons() {
        return hackathonRepository.findByIsActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void assignJudge(Long hackathonId, Long judgeId, User admin) {
        Hackathon hackathon = hackathonRepository.findById(hackathonId)
                .orElseThrow(() -> new EntityNotFoundException("Hackathon not found"));
        User judge = userRepository.findById(judgeId)
                .orElseThrow(() -> new EntityNotFoundException("Judge not found"));

        if (!hackathonJudgeRepository.existsByHackathonAndJudge(hackathon, judge)) {
            HackathonJudge hj = HackathonJudge.builder()
                    .hackathon(hackathon)
                    .judge(judge)
                    .build();
            hackathonJudgeRepository.save(hj);
            auditService.log(admin.getId(), "ASSIGN_JUDGE", "HACKATHON", hackathonId,
                    "Assigned judge " + judge.getEmail() + " to hackathon " + hackathon.getName(), null);
        }
    }

    @Transactional
    public void removeJudge(Long hackathonId, Long judgeId, User admin) {
        Hackathon hackathon = hackathonRepository.findById(hackathonId)
                .orElseThrow(() -> new EntityNotFoundException("Hackathon not found"));
        User judge = userRepository.findById(judgeId)
                .orElseThrow(() -> new EntityNotFoundException("Judge not found"));

        hackathonJudgeRepository.deleteByHackathonAndJudge(hackathon, judge);
        auditService.log(admin.getId(), "REMOVE_JUDGE", "HACKATHON", hackathonId,
                "Removed judge " + judge.getEmail() + " from hackathon " + hackathon.getName(), null);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getJudgesByHackathon(Long hackathonId) {
        Hackathon hackathon = hackathonRepository.findById(hackathonId)
                .orElseThrow(() -> new EntityNotFoundException("Hackathon not found"));
        return hackathonJudgeRepository.findByHackathon(hackathon).stream()
                .map(hj -> toUserResponse(hj.getJudge()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<HackathonResponse> getHackathonsForJudge(User judge) {
        return hackathonJudgeRepository.findByJudge(judge).stream()
                .map(hj -> toResponse(hj.getHackathon()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public HackathonResponse getHackathonById(Long id) {
        return hackathonRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Hackathon not found with id: " + id));
    }

    private UserResponse toUserResponse(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .email(u.getEmail())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .role(u.getRole().name())
                .createdAt(u.getCreatedAt())
                .build();
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
                .extraQuestion1Label(h.getExtraQuestion1Label())
                .extraQuestion2Label(h.getExtraQuestion2Label())
                .extraQuestion3Label(h.getExtraQuestion3Label())
                .createdAt(h.getCreatedAt())
                .build();
    }
}
