package com.verdictsphere.repository;

import com.verdictsphere.entity.Evaluation;
import com.verdictsphere.entity.Hackathon;
import com.verdictsphere.entity.Team;
import com.verdictsphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    List<Evaluation> findByJudge(User judge);
    List<Evaluation> findByTeam(Team team);
    List<Evaluation> findByTeamAndJudge(Team team, User judge);
    List<Evaluation> findByHackathon(Hackathon hackathon);
}
