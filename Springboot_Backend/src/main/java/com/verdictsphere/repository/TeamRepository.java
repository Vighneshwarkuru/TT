package com.verdictsphere.repository;

import com.verdictsphere.entity.AcceptanceStatus;
import com.verdictsphere.entity.Team;
import com.verdictsphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByHackathonId(Long hackathonId);
    List<Team> findByCreatedBy(User user);
    List<Team> findByHackathonIdAndCreatedBy(Long hackathonId, User user);
    List<Team> findByHackathonIdAndAcceptanceStatus(Long hackathonId, AcceptanceStatus status);
}
