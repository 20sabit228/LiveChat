package org.example.controller;

import org.example.model.Group;
import org.example.repository.GroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class GroupController {

    @Autowired
    private GroupRepository groupRepo;

    // Create group (creator auto-joins)
    @PostMapping("/groups")
    public ResponseEntity<Group> createGroup(@RequestBody Group groupRequest) {
        if (groupRequest.getName() == null || groupRequest.getName().isEmpty() ||
                groupRequest.getCreator() == null || groupRequest.getCreator().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Group group = new Group(groupRequest.getName(), groupRequest.getCreator());
        Group savedGroup = groupRepo.save(group);
        return ResponseEntity.ok(savedGroup);
    }

    // List all groups
    @GetMapping("/groups")
    public List<Group> getAllGroups() {
        return groupRepo.findAll();
    }

    // Join a group
    @PostMapping("/groups/{groupId}/join")
    public ResponseEntity<String> joinGroup(@PathVariable String groupId, @RequestBody JoinRequest joinRequest) {
        Optional<Group> optionalGroup = groupRepo.findById(groupId);
        if (optionalGroup.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Group group = optionalGroup.get();
        String username = joinRequest.getUsername();
        System.out.println("Join request received for group: " + groupId + " by user: " + username);
        if (username == null || username.isEmpty()) {
            return ResponseEntity.badRequest().body("Username is required");
        }
        if (!group.getMembers().contains(username)) {
            group.getMembers().add(username);
            groupRepo.save(group);
        }
        return ResponseEntity.ok("Joined group");
    }

    // Simple DTO for join request
    public static class JoinRequest {
        private String username;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
    }
}
