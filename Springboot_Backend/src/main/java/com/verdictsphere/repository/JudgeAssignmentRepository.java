package com.verdictsphere.repository;

import com.verdictsphere.entity.Hackathon;
import com.verdictsphere.entity.JudgeAssignment;
import com.verdictsphere.entity.Team;
import com.verdictsphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JudgeAssignmentRepository extends JpaRepository<JudgeAssignment, Long> {
    List<JudgeAssignment> findByJudge(User judge);
    List<JudgeAssignment> findByHackathon(Hackathon hackathon);
    boolean existsByJudgeAndTeamAndHackathon(User judge, Team team, Hackathon hackathon);
    List<JudgeAssignment> findByHackathonId(Long hackathonId);
}
