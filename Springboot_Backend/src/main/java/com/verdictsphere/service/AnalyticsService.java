package com.verdictsphere.service;

import com.verdictsphere.dto.AnalyticsSummary;
import com.verdictsphere.dto.JudgeStat;
import com.verdictsphere.dto.TeamStat;
import com.verdictsphere.entity.*;
import com.verdictsphere.exception.EntityNotFoundException;
import com.verdictsphere.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final HackathonRepository hackathonRepository;
    private final JudgeAssignmentRepository judgeAssignmentRepository;
    private final EvaluationRepository evaluationRepository;
    private final CriteriaRepository criteriaRepository;
    private final TeamRepository teamRepository;

    public AnalyticsSummary getAnalytics(Long hackathonId) {
        Hackathon hackathon = hackathonRepository.findById(hackathonId)
                .orElseThrow(() -> new EntityNotFoundException("Hackathon not found with id: " + hackathonId));

        List<JudgeAssignment> assignments = judgeAssignmentRepository.findByHackathon(hackathon);
        List<Evaluation> evaluations = evaluationRepository.findByHackathon(hackathon);

        // Judge stats: group assignments by judge
        Map<Long, List<JudgeAssignment>> assignmentsByJudge = assignments.stream()
                .collect(Collectors.groupingBy(a -> a.getJudge().getId()));

        // Evaluations: distinct (judge, team) pairs
        Set<String> evaluatedPairs = evaluations.stream()
                .map(e -> e.getJudge().getId() + ":" + e.getTeam().getId())
                .collect(Collectors.toSet());

        List<JudgeStat> judgeStats = assignmentsByJudge.entrySet().stream().map(entry -> {
            Long judgeId = entry.getKey();
            List<JudgeAssignment> judgeAssignments = entry.getValue();
            String judgeEmail = judgeAssignments.get(0).getJudge().getEmail();
            int totalAssigned = judgeAssignments.size();
            int evaluatedCount = (int) judgeAssignments.stream()
                    .filter(a -> evaluatedPairs.contains(judgeId + ":" + a.getTeam().getId()))
                    .count();
            return JudgeStat.builder()
                    .judgeId(judgeId)
                    .judgeEmail(judgeEmail)
                    .evaluatedCount(evaluatedCount)
                    .totalAssigned(totalAssigned)
                    .build();
        }).collect(Collectors.toList());

        // Team stats: group assignments by team
        Map<Long, List<JudgeAssignment>> assignmentsByTeam = assignments.stream()
                .collect(Collectors.groupingBy(a -> a.getTeam().getId()));

        List<TeamStat> teamStats = assignmentsByTeam.entrySet().stream().map(entry -> {
            Long teamId = entry.getKey();
            List<JudgeAssignment> teamAssignments = entry.getValue();
            String teamName = teamAssignments.get(0).getTeam().getTeamName();
            int totalJudges = teamAssignments.size();
            int evaluatedByCount = (int) teamAssignments.stream()
                    .filter(a -> evaluatedPairs.contains(a.getJudge().getId() + ":" + teamId))
                    .count();
            return TeamStat.builder()
                    .teamId(teamId)
                    .teamName(teamName)
                    .evaluatedByCount(evaluatedByCount)
                    .totalJudges(totalJudges)
                    .build();
        }).collect(Collectors.toList());

        return AnalyticsSummary.builder()
                .judgeStats(judgeStats)
                .teamStats(teamStats)
                .build();
    }

    public String exportResultsCsv(Long hackathonId) {
        Hackathon hackathon = hackathonRepository.findById(hackathonId)
                .orElseThrow(() -> new EntityNotFoundException("Hackathon not found with id: " + hackathonId));

        List<Criteria> criteriaList = criteriaRepository.findByHackathon(hackathon);
        List<Team> teams = teamRepository.findByHackathonId(hackathonId);
        List<Evaluation> evaluations = evaluationRepository.findByHackathon(hackathon);

        // Group evaluations by team then by criteria
        Map<Long, Map<Long, List<Integer>>> teamCriteriaScores = new HashMap<>();
        for (Evaluation eval : evaluations) {
            teamCriteriaScores
                    .computeIfAbsent(eval.getTeam().getId(), k -> new HashMap<>())
                    .computeIfAbsent(eval.getCriteria().getId(), k -> new ArrayList<>())
                    .add(eval.getScore());
        }

        // Compute weighted scores per team
        List<double[]> teamScores = new ArrayList<>(); // [teamIndex, weightedScore]
        double[] weightedScores = new double[teams.size()];

        BigDecimal totalWeight = criteriaList.stream()
                .map(c -> c.getWeight().multiply(BigDecimal.valueOf(c.getMaxScore())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        for (int i = 0; i < teams.size(); i++) {
            Team team = teams.get(i);
            Map<Long, List<Integer>> criteriaScoresForTeam = teamCriteriaScores.getOrDefault(team.getId(), Map.of());

            // Get distinct judges for this team
            Set<Long> judgesForTeam = evaluations.stream()
                    .filter(e -> e.getTeam().getId().equals(team.getId()))
                    .map(e -> e.getJudge().getId())
                    .collect(Collectors.toSet());

            if (judgesForTeam.isEmpty()) {
                weightedScores[i] = 0.0;
                continue;
            }

            double sumAcrossJudges = 0.0;
            for (Long judgeId : judgesForTeam) {
                double numerator = 0.0;
                for (Criteria c : criteriaList) {
                    List<Evaluation> judgeTeamCriteriaEvals = evaluations.stream()
                            .filter(e -> e.getTeam().getId().equals(team.getId())
                                    && e.getJudge().getId().equals(judgeId)
                                    && e.getCriteria().getId().equals(c.getId()))
                            .collect(Collectors.toList());
                    if (!judgeTeamCriteriaEvals.isEmpty()) {
                        numerator += judgeTeamCriteriaEvals.get(0).getScore()
                                * c.getWeight().doubleValue();
                    }
                }
                double denominator = totalWeight.doubleValue();
                sumAcrossJudges += denominator > 0 ? (numerator / denominator * 100) : 0;
            }
            weightedScores[i] = sumAcrossJudges / judgesForTeam.size();
        }

        // Sort teams by weighted score descending
        Integer[] indices = new Integer[teams.size()];
        for (int i = 0; i < indices.length; i++) indices[i] = i;
        Arrays.sort(indices, (a, b) -> Double.compare(weightedScores[b], weightedScores[a]));

        // Build CSV
        StringBuilder sb = new StringBuilder();
        sb.append("Rank,TeamName,WeightedScore");
        for (Criteria c : criteriaList) {
            sb.append(",").append(c.getName());
        }
        sb.append(",FinalRank\n");

        for (int rank = 1; rank <= indices.length; rank++) {
            int idx = indices[rank - 1];
            Team team = teams.get(idx);
            sb.append(rank).append(",")
                    .append(team.getTeamName()).append(",")
                    .append(String.format("%.4f", weightedScores[idx]));

            Map<Long, List<Integer>> criteriaScoresForTeam = teamCriteriaScores.getOrDefault(team.getId(), Map.of());
            for (Criteria c : criteriaList) {
                List<Integer> scores = criteriaScoresForTeam.getOrDefault(c.getId(), List.of());
                double avg = scores.isEmpty() ? 0.0 : scores.stream().mapToInt(Integer::intValue).average().orElse(0.0);
                sb.append(",").append(String.format("%.2f", avg));
            }
            sb.append(",").append(rank).append("\n");
        }

        return sb.toString();
    }
}
