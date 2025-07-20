package org.example.controller;

import org.example.model.Chatmessage;
import org.example.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;

import java.time.LocalDateTime;
import java.util.List;

@RestController
public class ChatController {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;


    @GetMapping("/messages")
    public List<Chatmessage> getAllMessages() {
        List<Chatmessage> messages = chatMessageRepository.findAllByOrderByTimestampAsc();
        System.out.println("Messages fetched: " + messages.size());
        return messages;
    }

    // REST endpoint for private chat history
    // In ChatController.java
    @GetMapping("/messages/{recipient}")
    public List<Chatmessage> getMessagesWithRecipient(
            @PathVariable String recipient,
            @RequestParam String sender
    ) {
        // Fetch messages where (sender=me AND recipient=them) OR (sender=them AND recipient=me)
        return chatMessageRepository.findBySenderAndRecipientOrSenderAndRecipientOrderByTimestampAsc(
                sender, recipient, recipient, sender
        );
    }


    // WebSocket endpoint to receive and broadcast messages

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload Chatmessage chatMessage) {
        chatMessage.setTimestamp(Instant.now());  // Use Instant.now()
        chatMessageRepository.save(chatMessage);
        messagingTemplate.convertAndSend("/topic/user/" + chatMessage.getSender(), chatMessage);
        messagingTemplate.convertAndSend("/topic/user/" + chatMessage.getRecipient(), chatMessage);

    }
    @GetMapping("/group-messages/{groupId}")
    public List<Chatmessage> getGroupMessages(@PathVariable String groupId) {
        return chatMessageRepository.findByGroupIdOrderByTimestampAsc(groupId);
    }

    // WebSocket endpoint for group chat
    @MessageMapping("/chat.sendGroupMessage")
    public void sendGroupMessage(@Payload Chatmessage chatmessage) {
        chatmessage.setTimestamp(Instant.now());
        chatMessageRepository.save(chatmessage);
        // Broadcast to all group members via a topic
        messagingTemplate.convertAndSend("/topic/group/" + chatmessage.getGroupId(), chatmessage);
    }
}


