package com.verdictsphere.controller;

import com.verdictsphere.dto.*;
import com.verdictsphere.entity.User;
import com.verdictsphere.repository.UserRepository;
import com.verdictsphere.service.*;
import com.verdictsphere.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/judge")
@PreAuthorize("hasRole('JUDGE')")
@RequiredArgsConstructor
public class JudgeController {

    private final TeamAcceptanceService teamAcceptanceService;
    private final JudgeAssignmentService judgeAssignmentService;
    private final EvaluationService evaluationService;
    private final LeaderboardService leaderboardService;
    private final UserRepository userRepository;

    // ── Team acceptance ───────────────────────────────────────────────────────

    @GetMapping("/teams")
    public ResponseEntity<List<TeamDetailResponse>> getAllTeams() {
        return ResponseEntity.ok(teamAcceptanceService.getAllTeams());
    }

    @PutMapping("/teams/{id}/accept")
    public ResponseEntity<Void> acceptTeam(@PathVariable Long id) {
        User judge = SecurityUtils.getCurrentUser(userRepository);
        teamAcceptanceService.acceptTeam(id, judge);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/teams/{id}/reject")
    public ResponseEntity<Void> rejectTeam(@PathVariable Long id) {
        User judge = SecurityUtils.getCurrentUser(userRepository);
        teamAcceptanceService.rejectTeam(id, judge);
        return ResponseEntity.ok().build();
    }

    // ── Assignments ───────────────────────────────────────────────────────────

    @GetMapping("/assignments")
    public ResponseEntity<List<TeamDetailResponse>> getMyAssignments() {
        User judge = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(judgeAssignmentService.getAssignmentsForJudge(judge));
    }

    // ── Evaluations ───────────────────────────────────────────────────────────

    @PostMapping("/evaluations")
    public ResponseEntity<List<EvaluationResponse>> submitEvaluation(@RequestBody EvaluationRequest req) {
        User judge = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(evaluationService.submitEvaluation(req, judge));
    }

    @PutMapping("/evaluations/{id}")
    public ResponseEntity<EvaluationResponse> updateEvaluation(@PathVariable Long id,
                                                                @RequestBody UpdateEvaluationRequest req) {
        User judge = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(evaluationService.updateEvaluation(id, req, judge));
    }

    @GetMapping("/evaluations")
    public ResponseEntity<List<EvaluationResponse>> getMyEvaluations() {
        User judge = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(evaluationService.getMyEvaluations(judge));
    }

    // ── Leaderboard ───────────────────────────────────────────────────────────

    @GetMapping("/leaderboard")
    public ResponseEntity<List<LeaderboardEntry>> getLeaderboard(@RequestParam Long hackathonId) {
        return ResponseEntity.ok(leaderboardService.getLeaderboard(hackathonId));
    }
}
