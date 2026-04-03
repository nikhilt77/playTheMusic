package com.visualizer.controller;

import com.visualizer.service.YouTubeService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;

@RestController
@RequestMapping("/api")
public class StreamController {

    private final YouTubeService youTubeService;

    public StreamController(YouTubeService youTubeService) {
        this.youTubeService = youTubeService;
    }

    @GetMapping("/stream")
    public ResponseEntity<?> getAudioStream(@RequestParam String videoId) {
        try {
            String streamUrl = youTubeService.getAudioStreamUrl(videoId);
            return ResponseEntity.ok(Collections.singletonMap("streamUrl", streamUrl));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @GetMapping("/proxy-audio")
    public void proxyAudio(@RequestParam String videoId, HttpServletResponse response) {
        try {
            response.setContentType("audio/mp4");
            youTubeService.streamAudio(videoId, response.getOutputStream());
        } catch (Exception e) {
            response.setStatus(500);
        }
    }

    @GetMapping("/info")
    public ResponseEntity<?> getSongInfo(@RequestParam String videoId) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String oembedUrl = "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=" + videoId + "&format=json";
            String jsonResponse = restTemplate.getForObject(oembedUrl, String.class);
            return ResponseEntity.ok(jsonResponse); // Return the raw JSON from YouTube directly to frontend
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Collections.singletonMap("error", e.getMessage()));
        }
    }
}
