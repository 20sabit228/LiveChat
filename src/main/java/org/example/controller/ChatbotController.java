package org.example.controller;

import org.example.service.OpenAIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gemini")
public class ChatbotController {

    @Autowired
    private OpenAIService geminiService;

    @PostMapping("/generate")
    public String generate(@RequestBody String prompt) {
        return geminiService.generateText(prompt);
    }
}
