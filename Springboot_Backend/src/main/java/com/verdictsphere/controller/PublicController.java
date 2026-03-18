package com.verdictsphere.controller;

import com.verdictsphere.dto.HackathonResponse;
import com.verdictsphere.dto.LeaderboardEntry;
import com.verdictsphere.dto.TeamSummary;
import com.verdictsphere.service.HackathonService;
import com.verdictsphere.service.LeaderboardService;
import com.verdictsphere.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final HackathonService hackathonService;
    private final LeaderboardService leaderboardService;
    private final TeamService teamService;

    @GetMapping("/active-hackathons")
    public ResponseEntity<List<HackathonResponse>> getActiveHackathons() {
        return ResponseEntity.ok(hackathonService.getActiveHackathons());
    }

    @GetMapping("/leaderboard/{hackathonId}")
    public ResponseEntity<List<LeaderboardEntry>> getLeaderboard(@PathVariable Long hackathonId) {
        return ResponseEntity.ok(leaderboardService.getLeaderboard(hackathonId));
    }

    @GetMapping("/teams/{hackathonId}")
    public ResponseEntity<List<TeamSummary>> getTeamsByHackathon(@PathVariable Long hackathonId) {
        return ResponseEntity.ok(teamService.getTeamSummaries(hackathonId));
    }
}
