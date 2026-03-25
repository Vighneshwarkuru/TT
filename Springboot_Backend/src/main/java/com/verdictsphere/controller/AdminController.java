package com.verdictsphere.controller;

import com.verdictsphere.dto.*;
import com.verdictsphere.entity.User;
import com.verdictsphere.repository.UserRepository;
import com.verdictsphere.service.*;
import com.verdictsphere.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminUserService adminUserService;
    private final HackathonService hackathonService;
    private final CriteriaService criteriaService;
    private final TeamAcceptanceService teamAcceptanceService;
    private final JudgeAssignmentService judgeAssignmentService;
    private final AnalyticsService analyticsService;
    private final AuditService auditService;
    private final UserRepository userRepository;

    // ── Judge management ──────────────────────────────────────────────────────

    @PostMapping("/judges")
    public ResponseEntity<UserResponse> createJudge(@Valid @RequestBody CreateJudgeRequest req) {
        User actor = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(adminUserService.createJudge(req, actor.getId()));
    }

    @GetMapping("/judges")
    public ResponseEntity<List<UserResponse>> getAllJudges() {
        return ResponseEntity.ok(adminUserService.getAllJudges());
    }

    @DeleteMapping("/judges/{id}")
    public ResponseEntity<Void> deleteJudge(@PathVariable Long id) {
        User actor = SecurityUtils.getCurrentUser(userRepository);
        adminUserService.deleteJudge(id, actor.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    // ── Hackathon management ──────────────────────────────────────────────────

    @PostMapping("/hackathons")
    public ResponseEntity<HackathonResponse> createHackathon(@RequestBody HackathonRequest req) {
        User admin = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(hackathonService.createHackathon(req, admin));
    }

    @GetMapping("/hackathons")
    public ResponseEntity<List<HackathonResponse>> getAllHackathons() {
        return ResponseEntity.ok(hackathonService.getAllHackathons());
    }

    @PutMapping("/hackathons/{id}")
    public ResponseEntity<HackathonResponse> updateHackathon(@PathVariable Long id,
                                                              @RequestBody HackathonRequest req) {
        User admin = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(hackathonService.updateHackathon(id, req, admin));
    }

    @DeleteMapping("/hackathons/{id}")
    public ResponseEntity<Void> deleteHackathon(@PathVariable Long id) {
        User admin = SecurityUtils.getCurrentUser(userRepository);
        hackathonService.deleteHackathon(id, admin);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/hackathons/{id}/judges/{judgeId}")
    public ResponseEntity<Void> assignJudge(@PathVariable Long id, @PathVariable Long judgeId) {
        User admin = SecurityUtils.getCurrentUser(userRepository);
        hackathonService.assignJudge(id, judgeId, admin);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/hackathons/{id}/judges/{judgeId}")
    public ResponseEntity<Void> removeJudge(@PathVariable Long id, @PathVariable Long judgeId) {
        User admin = SecurityUtils.getCurrentUser(userRepository);
        hackathonService.removeJudge(id, judgeId, admin);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/hackathons/{id}/judges")
    public ResponseEntity<List<UserResponse>> getJudgesByHackathon(@PathVariable Long id) {
        return ResponseEntity.ok(hackathonService.getJudgesByHackathon(id));
    }

    // ── Criteria management ───────────────────────────────────────────────────

    @PostMapping("/criteria")
    public ResponseEntity<CriteriaResponse> createCriteria(@RequestBody CriteriaRequest req) {
        User admin = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(criteriaService.createCriteria(req, admin));
    }

    @PutMapping("/criteria/{id}")
    public ResponseEntity<CriteriaResponse> updateCriteria(@PathVariable Long id,
                                                            @RequestBody CriteriaRequest req) {
        User admin = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(criteriaService.updateCriteria(id, req, admin));
    }

    @DeleteMapping("/criteria/{id}")
    public ResponseEntity<Void> deleteCriteria(@PathVariable Long id) {
        User admin = SecurityUtils.getCurrentUser(userRepository);
        criteriaService.deleteCriteria(id, admin);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/criteria/{hackathonId}")
    public ResponseEntity<List<CriteriaResponse>> getCriteriaByHackathon(@PathVariable Long hackathonId) {
        return ResponseEntity.ok(criteriaService.getCriteriaByHackathon(hackathonId));
    }

    // ── Team management ───────────────────────────────────────────────────────

    @GetMapping("/teams")
    public ResponseEntity<List<TeamDetailResponse>> getAllTeams() {
        return ResponseEntity.ok(teamAcceptanceService.getAllTeams());
    }

    @GetMapping("/teams/hackathon/{hackathonId}")
    public ResponseEntity<List<TeamDetailResponse>> getTeamsByHackathon(@PathVariable Long hackathonId) {
        return ResponseEntity.ok(teamAcceptanceService.getTeamsByHackathon(hackathonId));
    }

    @PutMapping("/teams/{id}/accept")
    public ResponseEntity<Void> acceptTeam(@PathVariable Long id) {
        User actor = SecurityUtils.getCurrentUser(userRepository);
        teamAcceptanceService.acceptTeam(id, actor);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/teams/{id}/reject")
    public ResponseEntity<Void> rejectTeam(@PathVariable Long id) {
        User actor = SecurityUtils.getCurrentUser(userRepository);
        teamAcceptanceService.rejectTeam(id, actor);
        return ResponseEntity.ok().build();
    }

    // ── Judge assignments ─────────────────────────────────────────────────────

    @PostMapping("/judge-assignments/auto/{hackathonId}")
    public ResponseEntity<List<AssignmentResponse>> autoAssign(@PathVariable Long hackathonId) {
        User admin = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(judgeAssignmentService.autoAssign(hackathonId, admin));
    }

    @PostMapping("/judge-assignments")
    public ResponseEntity<AssignmentResponse> manualAssign(@RequestBody AssignmentRequest req) {
        User admin = SecurityUtils.getCurrentUser(userRepository);
        return ResponseEntity.ok(judgeAssignmentService.manualAssign(req, admin));
    }

    @GetMapping("/judge-assignments/{hackathonId}")
    public ResponseEntity<List<AssignmentResponse>> getAssignmentsByHackathon(@PathVariable Long hackathonId) {
        return ResponseEntity.ok(judgeAssignmentService.getAssignmentsByHackathon(hackathonId));
    }

    // ── Analytics & Export ────────────────────────────────────────────────────

    @GetMapping("/analytics/{hackathonId}")
    public ResponseEntity<AnalyticsSummary> getAnalytics(@PathVariable Long hackathonId) {
        return ResponseEntity.ok(analyticsService.getAnalytics(hackathonId));
    }

    @GetMapping("/export/{hackathonId}")
    public ResponseEntity<byte[]> exportResultsCsv(@PathVariable Long hackathonId) {
        String csv = analyticsService.exportResultsCsv(hackathonId);
        byte[] bytes = csv.getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"hackathon-" + hackathonId + "-results.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }

    // ── Audit logs ────────────────────────────────────────────────────────────

    @GetMapping("/audit-logs")
    public ResponseEntity<Page<AuditLogResponse>> getAuditLogs(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) Long entityId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            Pageable pageable) {
        
        LocalDateTime from = dateFrom != null ? dateFrom.atStartOfDay() : null;
        LocalDateTime to = dateTo != null ? dateTo.atTime(LocalTime.MAX) : null;
        
        return ResponseEntity.ok(auditService.getAuditLogs(userId, action, entityType, entityId, from, to, pageable));
    }
}
