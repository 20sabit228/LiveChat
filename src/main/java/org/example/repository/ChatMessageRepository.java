package org.example.repository;

import org.example.model.Chatmessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatMessageRepository extends MongoRepository<Chatmessage, String> {
    List<Chatmessage> findByRecipientOrSenderOrderByTimestampAsc(String recipient, String sender);
    List<Chatmessage> findAllByOrderByTimestampAsc(); // For group chat
    // In ChatMessageRepository.java
    List<Chatmessage> findBySenderAndRecipientOrderByTimestampAsc(String sender, String recipient);
    List<Chatmessage> findBySenderAndRecipientOrSenderAndRecipientOrderByTimestampAsc(
            String sender1, String recipient1, String sender2, String recipient2
    );
    List<Chatmessage> findByGroupIdOrderByTimestampAsc(String groupId);


}

