package org.example.repository;

import org.example.model.Group;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface GroupRepository extends MongoRepository<Group, String> {
    // No extra methods needed for findAll()
}
