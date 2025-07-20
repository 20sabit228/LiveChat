package org.example.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "group")
public class Group {
        @Id
        private String id;
        private String name;
        private String creator;
        private List<String> members = new ArrayList<>();

        // Constructors, getters, setters
        public Group() {}

        public Group(String name, String creator) {
                this.name = name;
                this.creator = creator;
                this.members.add(creator); // Creator auto-joins
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getCreator() { return creator; }
        public void setCreator(String creator) { this.creator = creator; }

        public List<String> getMembers() { return members; }
        public void setMembers(List<String> members) { this.members = members; }
}
