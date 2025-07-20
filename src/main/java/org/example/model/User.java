// src/main/java/com/chatroom/model/User.java
package org.example.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "user") // or "users" if that's your MongoDB collection name
public class User {
    @Id
    private String id;
    private String username;
    private String password;
    // Add other fields if needed (e.g., email, password)

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
}
