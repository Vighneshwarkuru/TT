package com.verdictsphere.service;

import com.verdictsphere.dto.*;
import com.verdictsphere.entity.*;
import com.verdictsphere.exception.*;
import com.verdictsphere.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final JudgeAssignmentRepository judgeAssignmentRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final CriteriaRepository criteriaRepository;
    private final HackathonRepository hackathonRepository;
    private final AuditService auditService;

    @Transactional
    public List<EvaluationResponse> submitEvaluation(EvaluationRequest req, User judge) {
        Team team = teamRepository.findById(req.getTeamId())
                .orElseThrow(() -> new EntityNotFoundException("Team not found with id: " + req.getTeamId()));

        Hackathon hackathon = hackathonRepository.findById(req.getHackathonId())
                .orElseThrow(() -> new EntityNotFoundException("Hackathon not found with id: " + req.getHackathonId()));

        // Verify judge is assigned to the team
        boolean assigned = judgeAssignmentRepository.existsByJudgeAndTeamAndHackathon(judge, team, hackathon);
        if (!assigned) {
            throw new UnauthorizedAssignmentException("You are not assigned to evaluate this team.");
        }

        // Verify team is ACCEPTED
        if (team.getAcceptanceStatus() != AcceptanceStatus.ACCEPTED) {
            throw new TeamNotAcceptedException("Team has not been accepted for evaluation.");
        }

        List<Evaluation> saved = new ArrayList<>();

        for (CriteriaScore cs : req.getScores()) {
            Criteria criteria = criteriaRepository.findById(cs.getCriteriaId())
                    .orElseThrow(() -> new EntityNotFoundException("Criteria not found with id: " + cs.getCriteriaId()));

            if (cs.getScore() < 0 || cs.getScore() > criteria.getMaxScore()) {
                throw new ScoreOutOfRangeException(
                        "Score " + cs.getScore() + " is out of range [0, " + criteria.getMaxScore() + "] for criteria: " + criteria.getName());
            }

            // Upsert: find existing evaluation for judge+team+criteria
            List<Evaluation> existing = evaluationRepository.findByTeamAndJudge(team, judge).stream()
                    .filter(e -> e.getCriteria().getId().equals(criteria.getId()))
                    .collect(Collectors.toList());

            Evaluation evaluation;
            if (!existing.isEmpty()) {
                evaluation = existing.get(0);
                evaluation.setScore(cs.getScore());
                evaluation.setRemarks(cs.getRemarks());
            } else {
                evaluation = Evaluation.builder()
                        .hackathon(hackathon)
                        .judge(judge)
                        .team(team)
                        .criteria(criteria)
                        .score(cs.getScore())
                        .remarks(cs.getRemarks())
                        .build();
            }

            saved.add(evaluationRepository.save(evaluation));
        }

        auditService.log(judge.getId(), "SUBMIT_EVALUATION", "EVALUATION", team.getId(),
                "Judge " + judge.getEmail() + " submitted evaluation for team " + team.getTeamName(), null);

        return saved.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public EvaluationResponse updateEvaluation(Long evaluationId, UpdateEvaluationRequest req, User judge) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new EntityNotFoundException("Evaluation not found with id: " + evaluationId));

        if (!evaluation.getJudge().getId().equals(judge.getId())) {
            throw new AccessForbiddenException("You do not have permission to update this evaluation.");
        }

        Criteria criteria = evaluation.getCriteria();
        if (req.getScore() < 0 || req.getScore() > criteria.getMaxScore()) {
            throw new ScoreOutOfRangeException(
                    "Score " + req.getScore() + " is out of range [0, " + criteria.getMaxScore() + "] for criteria: " + criteria.getName());
        }

        evaluation.setScore(req.getScore());
        evaluation.setRemarks(req.getRemarks());
        Evaluation updated = evaluationRepository.save(evaluation);

        auditService.log(judge.getId(), "UPDATE_EVALUATION", "EVALUATION", evaluationId,
                "Judge " + judge.getEmail() + " updated evaluation " + evaluationId, null);

        return toResponse(updated);
    }

    public List<EvaluationResponse> getMyEvaluations(User judge) {
        return evaluationRepository.findByJudge(judge).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TeamScoreResponse getMyTeamScores(User participant) {
        // Find participant's team membership
        List<TeamMember> memberships = teamMemberRepository.findByUser(participant);
        if (memberships.isEmpty()) {
            throw new EntityNotFoundException("You are not a member of any team.");
        }

        // Use the first team membership found
        Team team = memberships.get(0).getTeam();
        List<Evaluation> evaluations = evaluationRepository.findByTeam(team);

        // Group by criteria
        Map<Long, List<Evaluation>> byCriteria = evaluations.stream()
                .collect(Collectors.groupingBy(e -> e.getCriteria().getId()));

        List<CriteriaScoreSummary> criteriaScores = byCriteria.entrySet().stream()
                .map(entry -> {
                    List<Evaluation> evals = entry.getValue();
                    Criteria criteria = evals.get(0).getCriteria();

                    double avg = evals.stream().mapToInt(Evaluation::getScore).average().orElse(0.0);

                    List<JudgeScore> judgeScores = evals.stream()
                            .map(e -> JudgeScore.builder()
                                    .judgeId(e.getJudge().getId())
                                    .score(e.getScore())
                                    .remarks(e.getRemarks())
                                    .build())
                            .collect(Collectors.toList());

                    return CriteriaScoreSummary.builder()
                            .criteriaId(criteria.getId())
                            .criteriaName(criteria.getName())
                            .averageScore(avg)
                            .judgeScores(judgeScores)
                            .build();
                })
                .collect(Collectors.toList());

        return TeamScoreResponse.builder()
                .teamId(team.getId())
                .teamName(team.getTeamName())
                .criteriaScores(criteriaScores)
                .build();
    }

    private EvaluationResponse toResponse(Evaluation e) {
        return EvaluationResponse.builder()
                .id(e.getId())
                .hackathonId(e.getHackathon().getId())
                .judgeId(e.getJudge().getId())
                .teamId(e.getTeam().getId())
                .criteriaId(e.getCriteria().getId())
                .criteriaName(e.getCriteria().getName())
                .score(e.getScore())
                .maxScore(e.getCriteria().getMaxScore())
                .remarks(e.getRemarks())
                .evaluatedAt(e.getEvaluatedAt())
                .build();
    }
}
