package com.verdictsphere.repository;

import com.verdictsphere.entity.JoinRequestStatus;
import com.verdictsphere.entity.Team;
import com.verdictsphere.entity.TeamJoinRequest;
import com.verdictsphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamJoinRequestRepository extends JpaRepository<TeamJoinRequest, Long> {
    List<TeamJoinRequest> findByTeamAndStatus(Team team, JoinRequestStatus status);
    boolean existsByTeamAndRequesterAndStatus(Team team, User requester, JoinRequestStatus status);
    List<TeamJoinRequest> findByRequesterAndStatus(User requester, JoinRequestStatus status);
}
