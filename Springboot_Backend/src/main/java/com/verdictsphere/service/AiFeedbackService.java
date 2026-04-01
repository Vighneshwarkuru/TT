package com.verdictsphere.service;

import com.verdictsphere.dto.AiFeedbackRequest;
import com.verdictsphere.dto.AiFeedbackResponse;
import com.verdictsphere.dto.EvaluationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiFeedbackService {

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    private static final String GEMINI_URL =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=";

    public AiFeedbackResponse generateFeedback(AiFeedbackRequest req) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            return new AiFeedbackResponse(buildFallbackSummary(req));
        }

        String prompt = buildPrompt(req);

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", prompt)
                ))
            ),
            "generationConfig", Map.of(
                "maxOutputTokens", 300,
                "temperature", 0.7
            )
        );

        try {
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                GEMINI_URL + geminiApiKey, entity, Map.class
            );

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> candidates =
                (List<Map<String, Object>>) response.getBody().get("candidates");
            @SuppressWarnings("unchecked")
            Map<String, Object> content =
                (Map<String, Object>) candidates.get(0).get("content");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> parts =
                (List<Map<String, Object>>) content.get("parts");
            String text = (String) parts.get(0).get("text");

            return new AiFeedbackResponse(text.trim());
        } catch (Exception e) {
            return new AiFeedbackResponse(buildFallbackSummary(req));
        }
    }

    private String buildPrompt(AiFeedbackRequest req) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an expert hackathon judge assistant. ")
          .append("Write a concise evaluation summary (3-4 sentences) for team \"")
          .append(req.getTeamName())
          .append("\" based on the following judge scores and remarks:\n\n");

        for (EvaluationResponse eval : req.getEvaluations()) {
            sb.append("- ").append(eval.getCriteriaName())
              .append(": ").append(eval.getScore()).append("/").append(eval.getMaxScore());
            if (eval.getRemarks() != null && !eval.getRemarks().isBlank()) {
                sb.append(" — \"").append(eval.getRemarks()).append("\"");
            }
            sb.append("\n");
        }

        sb.append("\nHighlight strengths, note areas for improvement, and end with an encouraging closing remark. ")
          .append("Be constructive and professional.");
        return sb.toString();
    }

    private String buildFallbackSummary(AiFeedbackRequest req) {
        if (req.getEvaluations() == null || req.getEvaluations().isEmpty()) {
            return "No evaluation data available to generate a summary.";
        }

        double avgPercent = req.getEvaluations().stream()
            .filter(e -> e.getMaxScore() > 0)
            .mapToDouble(e -> (double) e.getScore() / e.getMaxScore() * 100)
            .average()
            .orElse(0);

        String topCriteria = req.getEvaluations().stream()
            .max((a, b) -> Double.compare(
                (double) a.getScore() / Math.max(a.getMaxScore(), 1),
                (double) b.getScore() / Math.max(b.getMaxScore(), 1)))
            .map(EvaluationResponse::getCriteriaName)
            .orElse("overall performance");

        return String.format(
            "Team \"%s\" achieved an average score of %.1f%% across all criteria. " +
            "Their strongest area was %s. " +
            "The team demonstrated solid effort and there is clear potential for further growth. " +
            "Keep up the great work!",
            req.getTeamName(), avgPercent, topCriteria
        );
    }
}
