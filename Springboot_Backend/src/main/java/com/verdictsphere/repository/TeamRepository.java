package com.verdictsphere.repository;

import com.verdictsphere.entity.AcceptanceStatus;
import com.verdictsphere.entity.Team;
import com.verdictsphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByHackathonId(Long hackathonId);
    List<Team> findByCreatedBy(User user);
    List<Team> findByHackathonIdAndCreatedBy(Long hackathonId, User user);
    List<Team> findByHackathonIdAndAcceptanceStatus(Long hackathonId, AcceptanceStatus status);
    List<Team> findByTeamNameIgnoreCase(String teamName);
    Optional<Team> findByHackathonIdAndTeamNameIgnoreCase(Long hackathonId, String teamName);
}
