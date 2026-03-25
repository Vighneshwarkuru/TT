package com.verdictsphere.repository;

import com.verdictsphere.entity.Hackathon;
import com.verdictsphere.entity.HackathonJudge;
import com.verdictsphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HackathonJudgeRepository extends JpaRepository<HackathonJudge, Long> {
    List<HackathonJudge> findByJudge(User judge);
    List<HackathonJudge> findByHackathon(Hackathon hackathon);
    Optional<HackathonJudge> findByHackathonAndJudge(Hackathon hackathon, User judge);
    boolean existsByHackathonAndJudge(Hackathon hackathon, User judge);
    void deleteByHackathonAndJudge(Hackathon hackathon, User judge);
}
