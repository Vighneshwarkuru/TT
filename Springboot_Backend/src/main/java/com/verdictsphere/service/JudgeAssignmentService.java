package com.verdictsphere.service;

import com.verdictsphere.dto.AssignmentRequest;
import com.verdictsphere.dto.AssignmentResponse;
import com.verdictsphere.dto.TeamDetailResponse;
import com.verdictsphere.entity.*;
import com.verdictsphere.exception.DuplicateAssignmentException;
import com.verdictsphere.exception.EntityNotFoundException;
import com.verdictsphere.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JudgeAssignmentService {

    private final JudgeAssignmentRepository judgeAssignmentRepository;
    private final HackathonRepository hackathonRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Transactional
    public List<AssignmentResponse> autoAssign(Long hackathonId, User admin) {
        Hackathon hackathon = hackathonRepository.findById(hackathonId)
                .orElseThrow(() -> new EntityNotFoundException("Hackathon not found with id: " + hackathonId));

        List<Team> acceptedTeams = teamRepository.findByHackathonId(hackathonId).stream()
                .filter(t -> t.getAcceptanceStatus() == AcceptanceStatus.ACCEPTED)
                .collect(Collectors.toList());

        List<User> judges = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.JUDGE)
                .collect(Collectors.toList());

        if (judges.isEmpty() || acceptedTeams.isEmpty()) {
            return List.of();
        }

        List<JudgeAssignment> newAssignments = new ArrayList<>();
        int judgeCount = judges.size();

        for (int i = 0; i < acceptedTeams.size(); i++) {
            Team team = acceptedTeams.get(i);
            User judge = judges.get(i % judgeCount);

            // Skip duplicates
            if (!judgeAssignmentRepository.existsByJudgeAndTeamAndHackathon(judge, team, hackathon)) {
                JudgeAssignment assignment = JudgeAssignment.builder()
                        .hackathon(hackathon)
                        .judge(judge)
                        .team(team)
                        .build();
                newAssignments.add(judgeAssignmentRepository.save(assignment));
            }
        }

        auditService.log(admin.getId(), "AUTO_ASSIGN", "JUDGE_ASSIGNMENT", hackathonId,
                "Auto-assigned " + newAssignments.size() + " teams for hackathon " + hackathonId, null);

        return newAssignments.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public AssignmentResponse manualAssign(AssignmentRequest req, User admin) {
        Hackathon hackathon = hackathonRepository.findById(req.getHackathonId())
                .orElseThrow(() -> new EntityNotFoundException("Hackathon not found with id: " + req.getHackathonId()));

        User judge = userRepository.findById(req.getJudgeId())
                .orElseThrow(() -> new EntityNotFoundException("Judge not found with id: " + req.getJudgeId()));

        Team team = teamRepository.findById(req.getTeamId())
                .orElseThrow(() -> new EntityNotFoundException("Team not found with id: " + req.getTeamId()));

        if (judgeAssignmentRepository.existsByJudgeAndTeamAndHackathon(judge, team, hackathon)) {
            throw new DuplicateAssignmentException("Judge is already assigned to this team in this hackathon");
        }

        JudgeAssignment assignment = JudgeAssignment.builder()
                .hackathon(hackathon)
                .judge(judge)
                .team(team)
                .build();

        JudgeAssignment saved = judgeAssignmentRepository.save(assignment);

        auditService.log(admin.getId(), "MANUAL_ASSIGN", "JUDGE_ASSIGNMENT", saved.getId(),
                "Assigned judge " + judge.getEmail() + " to team " + team.getTeamName(), null);

        return toResponse(saved);
    }

    public List<AssignmentResponse> getAssignmentsByHackathon(Long hackathonId) {
        return judgeAssignmentRepository.findByHackathonId(hackathonId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<TeamDetailResponse> getAssignmentsForJudge(User judge) {
        return judgeAssignmentRepository.findByJudge(judge).stream()
                .map(a -> toTeamDetailResponse(a.getTeam()))
                .collect(Collectors.toList());
    }

    private TeamDetailResponse toTeamDetailResponse(com.verdictsphere.entity.Team team) {
        return TeamDetailResponse.builder()
                .id(team.getId())
                .teamName(team.getTeamName())
                .hackathonId(team.getHackathonId())
                .acceptanceStatus(team.getAcceptanceStatus().name())
                .githubUrl(team.getGithubUrl())
                .demoUrl(team.getDemoUrl())
                .presentationUrl(team.getPresentationUrl())
                .createdAt(team.getCreatedAt())
                .build();
    }

    private AssignmentResponse toResponse(JudgeAssignment a) {
        return AssignmentResponse.builder()
                .id(a.getId())
                .hackathonId(a.getHackathon().getId())
                .judgeId(a.getJudge().getId())
                .judgeEmail(a.getJudge().getEmail())
                .teamId(a.getTeam().getId())
                .teamName(a.getTeam().getTeamName())
                .assignedAt(a.getAssignedAt())
                .build();
    }
}
