package com.verdictsphere.service;

import com.verdictsphere.dto.*;
import com.verdictsphere.entity.*;
import com.verdictsphere.exception.*;
import com.verdictsphere.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

    private static final int MAX_TEAM_SIZE = 4;

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamJoinRequestRepository teamJoinRequestRepository;
    private final AuditService auditService;

    // ── Team creation ─────────────────────────────────────────────────────────

    @Transactional
    public TeamDetailResponse createTeam(CreateTeamRequest req, User participant) {
        // Validate participant not already on a team in this hackathon
        validateNotAlreadyOnTeam(req.getHackathonId(), participant);

        Team team = Team.builder()
                .teamName(req.getTeamName())
                .hackathonId(req.getHackathonId())
                .projectTitle(req.getProjectTitle())
                .abstractContent(req.getAbstractContent())
                .extraQuestion1(req.getExtraQuestion1())
                .extraQuestion2(req.getExtraQuestion2())
                .extraQuestion3(req.getExtraQuestion3())
                .createdBy(participant)
                .acceptanceStatus(AcceptanceStatus.PENDING)
                .build();

        team = teamRepository.save(team);

        TeamMember member = TeamMember.builder()
                .team(team)
                .user(participant)
                .build();
        teamMemberRepository.save(member);

        auditService.log(participant.getId(), "CREATE_TEAM", "TEAM", team.getId(),
                "Participant " + participant.getEmail() + " created team " + team.getTeamName(), null);

        return toDetailResponse(team);
    }

    @Transactional(readOnly = true)
    public TeamDetailResponse getMyTeam(User participant) {
        List<TeamMember> memberships = teamMemberRepository.findByUser(participant);
        if (memberships.isEmpty()) {
            return null;
        }
        // If multiple memberships exist, try to find one for an active hackathon context if possible
        // For now, we return the first one as per existing logic, but with transaction safety.
        return toDetailResponse(memberships.get(0).getTeam());
    }

    // ── Join request flow ─────────────────────────────────────────────────────

    @Transactional
    public JoinRequestResponse requestToJoin(JoinTeamRequest req, User participant) {
        Team team = resolveTeam(req);

        // Validate participant not already on a team in this hackathon
        validateNotAlreadyOnTeam(team.getHackathonId(), participant);

        // Validate team not full
        long memberCount = teamMemberRepository.countByTeam(team);
        if (memberCount >= MAX_TEAM_SIZE) {
            throw new TeamFullException("Team is full");
        }

        // Validate no existing PENDING request
        if (teamJoinRequestRepository.existsByTeamAndRequesterAndStatus(team, participant, JoinRequestStatus.PENDING)) {
            throw new DuplicateJoinRequestException("You already have a pending join request for this team.");
        }

        TeamJoinRequest joinRequest = TeamJoinRequest.builder()
                .team(team)
                .requester(participant)
                .status(JoinRequestStatus.PENDING)
                .build();

        joinRequest = teamJoinRequestRepository.save(joinRequest);

        return toJoinRequestResponse(joinRequest);
    }

    @Transactional(readOnly = true)
    public List<JoinRequestResponse> getJoinRequestsForMyTeam(User teamLead) {
        // Find teams where this user is a member AND is the creator (lead)
        List<Team> myLeadTeams = teamRepository.findByCreatedBy(teamLead);
        if (myLeadTeams.isEmpty()) {
            throw new EntityNotFoundException("You have not created any team.");
        }
        
        // Return join requests for all teams created by this user
        return teamJoinRequestRepository.findByTeamIn(myLeadTeams).stream()
                .filter(req -> req.getStatus() == JoinRequestStatus.PENDING)
                .map(this::toJoinRequestResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void acceptJoinRequest(Long requestId, User teamLead) {
        TeamJoinRequest request = teamJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Join request not found with id: " + requestId));

        if (!request.getTeam().getCreatedBy().getId().equals(teamLead.getId())) {
            throw new AccessForbiddenException("You do not have permission to manage this team's join requests.");
        }


        Team team = request.getTeam();
        
        // Validate requester not already on a team in this hackathon
        validateNotAlreadyOnTeam(team.getHackathonId(), request.getRequester());
        
        long memberCount = teamMemberRepository.countByTeam(team);
        if (memberCount >= MAX_TEAM_SIZE) {
            throw new TeamFullException("Team is full");
        }

        TeamMember member = TeamMember.builder()
                .team(team)
                .user(request.getRequester())
                .build();
        teamMemberRepository.save(member);

        request.setStatus(JoinRequestStatus.ACCEPTED);
        teamJoinRequestRepository.save(request);

        auditService.log(teamLead.getId(), "ACCEPT_JOIN_REQUEST", "TEAM_JOIN_REQUEST", requestId,
                "Team lead " + teamLead.getEmail() + " accepted join request " + requestId, null);
    }

    @Transactional
    public void rejectJoinRequest(Long requestId, User teamLead) {
        TeamJoinRequest request = teamJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Join request not found with id: " + requestId));

        if (!request.getTeam().getCreatedBy().getId().equals(teamLead.getId())) {
            throw new AccessForbiddenException("You do not have permission to manage this team's join requests.");
        }

        request.setStatus(JoinRequestStatus.REJECTED);
        teamJoinRequestRepository.save(request);
    }

    @Transactional
    public void removeMember(Long userId, User teamLead) {
        List<Team> myTeams = teamRepository.findByCreatedBy(teamLead);
        if (myTeams.isEmpty()) {
            throw new EntityNotFoundException("You have not created any team.");
        }
        Team team = myTeams.get(0);

        List<TeamMember> members = teamMemberRepository.findByTeam(team);
        TeamMember toRemove = members.stream()
                .filter(m -> m.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("User " + userId + " is not a member of your team."));

        teamMemberRepository.delete(toRemove);

        auditService.log(teamLead.getId(), "REMOVE_MEMBER", "TEAM_MEMBER", userId,
                "Team lead " + teamLead.getEmail() + " removed user " + userId + " from team " + team.getTeamName(),
                null);
    }

    // ── Project submission ────────────────────────────────────────────────────

    @Transactional
    public TeamDetailResponse submitProject(ProjectSubmissionRequest req, User participant) {
        List<TeamMember> memberships = teamMemberRepository.findByUser(participant);
        if (memberships.isEmpty()) {
            throw new EntityNotFoundException("You are not a member of any team.");
        }
        Team team = memberships.get(0).getTeam();

        validateUrl(req.getGithubUrl(), "GitHub URL");
        validateUrl(req.getDemoUrl(), "Demo URL");
        validateUrl(req.getPresentationUrl(), "Presentation URL");

        team.setGithubUrl(req.getGithubUrl());
        team.setDemoUrl(req.getDemoUrl());
        team.setPresentationUrl(req.getPresentationUrl());
        team = teamRepository.save(team);

        return toDetailResponse(team);
    }

    // ── Public team listing ───────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TeamSummary> getTeamSummaries(Long hackathonId) {
        return teamRepository.findByHackathonId(hackathonId).stream()
                .map(team -> TeamSummary.builder()
                        .id(team.getId())
                        .teamName(team.getTeamName())
                        .memberCount(teamMemberRepository.countByTeam(team))
                        .maxCapacity(MAX_TEAM_SIZE)
                        .hackathonId(team.getHackathonId())
                        .build())
                .collect(Collectors.toList());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void validateNotAlreadyOnTeam(Long hackathonId, User participant) {
        List<TeamMember> memberships = teamMemberRepository.findByUser(participant);
        boolean alreadyOnTeam = memberships.stream()
                .anyMatch(m -> m.getTeam().getHackathonId().equals(hackathonId));
        if (alreadyOnTeam) {
            throw new DuplicateMembershipException("You are already on a team in this hackathon.");
        }
    }

    private Team resolveTeam(JoinTeamRequest req) {
        if (req.getTeamId() != null) {
            return teamRepository.findById(req.getTeamId())
                    .orElseThrow(() -> new EntityNotFoundException("Team not found with id: " + req.getTeamId()));
        }
        if (req.getTeamName() != null && !req.getTeamName().isBlank()) {
            // If we have a hackathonId in the request (hypothetically), we should use it.
            // Since req doesn't have it, we use the first one found but log a warning if multiple exist.
            List<Team> teams = teamRepository.findByTeamNameIgnoreCase(req.getTeamName());
            if (teams.isEmpty()) {
                throw new EntityNotFoundException("Team not found with name: " + req.getTeamName());
            }
            return teams.get(0);
        }
        throw new EntityNotFoundException("Either teamId or teamName must be provided.");
    }

    private void validateUrl(String url, String fieldName) {
        if (url != null && !url.isBlank()) {
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                throw new InvalidUrlException(fieldName + " must start with http:// or https://");
            }
        }
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

    private JoinRequestResponse toJoinRequestResponse(TeamJoinRequest req) {
        User requester = req.getRequester();
        return JoinRequestResponse.builder()
                .id(req.getId())
                .teamId(req.getTeam().getId())
                .teamName(req.getTeam().getTeamName())
                .requesterId(requester.getId())
                .requesterEmail(requester.getEmail())
                .requesterFirstName(requester.getFirstName())
                .requesterLastName(requester.getLastName())
                .status(req.getStatus().name())
                .createdAt(req.getCreatedAt())
                .build();
    }
}
