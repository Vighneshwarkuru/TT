package com.verdictsphere.repository;

import com.verdictsphere.entity.Team;
import com.verdictsphere.entity.TeamMember;
import com.verdictsphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    List<TeamMember> findByTeam(Team team);
    List<TeamMember> findByUser(User user);
    long countByTeam(Team team);
    boolean existsByTeamAndUser(Team team, User user);
    List<TeamMember> findByTeamIn(List<Team> teams);
}
