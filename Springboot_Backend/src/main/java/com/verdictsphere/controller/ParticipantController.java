package com.verdictsphere.controller;

import com.verdictsphere.dto.*;
import com.verdictsphere.entity.User;
import com.verdictsphere.repository.UserRepository;
import com.verdictsphere.service.*;
import com.verdictsphere.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/participant")
@PreAuthorize("hasRole('PARTICIPANT')")
@RequiredArgsConstructor
public class ParticipantController {

    private final TeamService teamService;
    private final EvaluationService evaluationService;
    private final LeaderboardService leaderboardService;
    private final UserRepository userRepository;

    // ── Team management ───────────────────────────────────────────────────────

    @PostMapping("/team")
    public ResponseEntity<TeamDetailResponse> createTeam(@Valid @RequestBody CreateTeamRequest req) {
        User participant = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(teamService.createTeam(req, participant));
    }

    @GetMapping("/team")
    public ResponseEntity<TeamDetailResponse> getMyTeam() {
        User participant = SecurityUtils.getCurrentUser(userRepository);
        TeamDetailResponse team = teamService.getMyTeam(participant);
        if (team == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(team);
    }

    // ── Join requests ─────────────────────────────────────────────────────────

    @PostMapping("/team/join")
    public ResponseEntity<JoinRequestResponse> requestToJoin(@RequestBody JoinTeamRequest req) {
        User participant = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(teamService.requestToJoin(req, participant));
    }

    @GetMapping("/team/join-requests")
    public ResponseEntity<List<JoinRequestResponse>> getJoinRequests() {
        User participant = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(teamService.getJoinRequestsForMyTeam(participant));
    }

    @PutMapping("/team/join-requests/{id}/accept")
    public ResponseEntity<Void> acceptJoinRequest(@PathVariable Long id) {
        User participant = SecurityUtils.getCurrentUser(userRepository);
        teamService.acceptJoinRequest(id, participant);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/team/join-requests/{id}/reject")
    public ResponseEntity<Void> rejectJoinRequest(@PathVariable Long id) {
        User participant = SecurityUtils.getCurrentUser(userRepository);
        teamService.rejectJoinRequest(id, participant);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/team/members/{userId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long userId) {
        User participant = SecurityUtils.getCurrentUser(userRepository);
        teamService.removeMember(userId, participant);
        return ResponseEntity.noContent().build();
    }

    // ── Project submission ────────────────────────────────────────────────────

    @PutMapping("/team/submission")
    public ResponseEntity<TeamDetailResponse> submitProject(@RequestBody ProjectSubmissionRequest req) {
        User participant = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(teamService.submitProject(req, participant));
    }

    // ── Scores & Leaderboard ──────────────────────────────────────────────────

    @GetMapping("/scores")
    public ResponseEntity<TeamScoreResponse> getMyScores() {
        User participant = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(evaluationService.getMyTeamScores(participant));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<LeaderboardEntry>> getLeaderboard(@RequestParam Long hackathonId) {
        return ResponseEntity.ok(leaderboardService.getLeaderboard(hackathonId));
    }
}
