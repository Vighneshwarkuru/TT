package com.verdictsphere.service;

import com.verdictsphere.dto.LeaderboardEntry;
import com.verdictsphere.entity.*;
import com.verdictsphere.exception.EntityNotFoundException;
import com.verdictsphere.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final HackathonRepository hackathonRepository;
    private final TeamRepository teamRepository;
    private final EvaluationRepository evaluationRepository;
    private final CriteriaRepository criteriaRepository;

    public List<LeaderboardEntry> getLeaderboard(Long hackathonId) {
        Hackathon hackathon = hackathonRepository.findById(hackathonId)
                .orElseThrow(() -> new EntityNotFoundException("Hackathon not found with id: " + hackathonId));

        List<Team> teams = teamRepository.findByHackathonId(hackathonId);
        List<Evaluation> evaluations = evaluationRepository.findByHackathon(hackathon);
        List<Criteria> criteriaList = criteriaRepository.findByHackathon(hackathon);

        BigDecimal totalWeight = criteriaList.stream()
                .map(c -> c.getWeight().multiply(BigDecimal.valueOf(c.getMaxScore())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Find innovation criteria (case-insensitive)
        Optional<Criteria> innovationCriteria = criteriaList.stream()
                .filter(c -> c.getName().equalsIgnoreCase("innovation"))
                .findFirst();

        List<LeaderboardEntry> entries = new ArrayList<>();

        for (Team team : teams) {
            Set<Long> judgesForTeam = evaluations.stream()
                    .filter(e -> e.getTeam().getId().equals(team.getId()))
                    .map(e -> e.getJudge().getId())
                    .collect(Collectors.toSet());

            if (judgesForTeam.isEmpty()) {
                entries.add(LeaderboardEntry.builder()
                        .teamId(team.getId())
                        .teamName(team.getTeamName())
                        .weightedScore(0.0)
                        .innovationScore(0.0)
                        .judgeCount(0)
                        .rank(0)
                        .build());
                continue;
            }

            double sumAcrossJudges = 0.0;
            double innovationSum = 0.0;
            int innovationCount = 0;

            for (Long judgeId : judgesForTeam) {
                double numerator = 0.0;
                for (Criteria c : criteriaList) {
                    Optional<Evaluation> eval = evaluations.stream()
                            .filter(e -> e.getTeam().getId().equals(team.getId())
                                    && e.getJudge().getId().equals(judgeId)
                                    && e.getCriteria().getId().equals(c.getId()))
                            .findFirst();
                    if (eval.isPresent()) {
                        numerator += eval.get().getScore() * c.getWeight().doubleValue();

                        if (innovationCriteria.isPresent() && c.getId().equals(innovationCriteria.get().getId())) {
                            innovationSum += eval.get().getScore();
                            innovationCount++;
                        }
                    }
                }
                double denominator = totalWeight.doubleValue();
                sumAcrossJudges += denominator > 0 ? (numerator / denominator * 100) : 0;
            }

            double weightedScore = sumAcrossJudges / judgesForTeam.size();
            double innovationScore = innovationCount > 0 ? innovationSum / innovationCount : 0.0;

            entries.add(LeaderboardEntry.builder()
                    .teamId(team.getId())
                    .teamName(team.getTeamName())
                    .weightedScore(Math.round(weightedScore * 10000.0) / 10000.0)
                    .innovationScore(innovationScore)
                    .judgeCount(judgesForTeam.size())
                    .rank(0)
                    .build());
        }

        // Sort: descending by weightedScore, tie-break by innovationScore descending
        entries.sort((a, b) -> {
            int cmp = Double.compare(b.getWeightedScore(), a.getWeightedScore());
            if (cmp != 0) return cmp;
            return Double.compare(b.getInnovationScore(), a.getInnovationScore());
        });

        // Assign ranks
        for (int i = 0; i < entries.size(); i++) {
            entries.get(i).setRank(i + 1);
        }

        return entries;
    }
}
