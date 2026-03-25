package com.verdictsphere.service;

import com.verdictsphere.dto.TeamDetailResponse;
import com.verdictsphere.dto.UserResponse;
import com.verdictsphere.entity.AcceptanceStatus;
import com.verdictsphere.entity.Team;
import com.verdictsphere.entity.User;
import com.verdictsphere.exception.EntityNotFoundException;
import com.verdictsphere.repository.TeamMemberRepository;
import com.verdictsphere.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class TeamAcceptanceService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final AuditService auditService;

    @Transactional
    public void acceptTeam(Long teamId, User actor) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new EntityNotFoundException("Team not found with id: " + teamId));

        team.setAcceptanceStatus(AcceptanceStatus.ACCEPTED);
        teamRepository.save(team);

        auditService.log(actor.getId(), "ACCEPT_TEAM", "TEAM", teamId,
                "Accepted team: " + team.getTeamName(), null);
    }

    @Transactional
    public void rejectTeam(Long teamId, User actor) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new EntityNotFoundException("Team not found with id: " + teamId));

        team.setAcceptanceStatus(AcceptanceStatus.REJECTED);
        teamRepository.save(team);

        auditService.log(actor.getId(), "REJECT_TEAM", "TEAM", teamId,
                "Rejected team: " + team.getTeamName(), null);
    }

    @Transactional(readOnly = true)
    public List<TeamDetailResponse> getAllTeams() {
        return teamRepository.findAll().stream()
                .map(this::toDetailResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TeamDetailResponse> getTeamsByHackathon(Long hackathonId) {
        return teamRepository.findByHackathonId(hackathonId).stream()
                .map(this::toDetailResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TeamDetailResponse> getTeamsByHackathonIds(List<Long> hackathonIds) {
        return teamRepository.findAll().stream()
                .filter(team -> hackathonIds.contains(team.getHackathonId()))
                .map(this::toDetailResponse)
                .collect(Collectors.toList());
    }

    private TeamDetailResponse toDetailResponse(Team team) {
        long memberCount = teamMemberRepository.countByTeam(team);

        UserResponse createdByResponse = null;
        if (team.getCreatedBy() != null) {
            User creator = team.getCreatedBy();
            createdByResponse = UserResponse.builder()
                    .id(creator.getId())
                    .email(creator.getEmail())
                    .firstName(creator.getFirstName())
                    .lastName(creator.getLastName())
                    .role(creator.getRole().name())
                    .createdAt(creator.getCreatedAt())
                    .build();
        }

        return TeamDetailResponse.builder()
                .id(team.getId())
                .teamName(team.getTeamName())
                .projectTitle(team.getProjectTitle())
                .abstractContent(team.getAbstractContent())
                .extraQuestion1(team.getExtraQuestion1())
                .extraQuestion2(team.getExtraQuestion2())
                .extraQuestion3(team.getExtraQuestion3())
                .hackathonId(team.getHackathonId())
                .createdBy(createdByResponse)
                .acceptanceStatus(team.getAcceptanceStatus().name())
                .memberCount(memberCount)
                .githubUrl(team.getGithubUrl())
                .demoUrl(team.getDemoUrl())
                .presentationUrl(team.getPresentationUrl())
                .members(teamMemberRepository.findByTeam(team).stream()
                        .map(m -> UserResponse.builder()
                                .id(m.getUser().getId())
                                .email(m.getUser().getEmail())
                                .firstName(m.getUser().getFirstName())
                                .lastName(m.getUser().getLastName())
                                .role(m.getUser().getRole().name())
                                .createdAt(m.getUser().getCreatedAt())
                                .build())
                        .collect(Collectors.toList()))
                .createdAt(team.getCreatedAt())
                .build();
    }
}
