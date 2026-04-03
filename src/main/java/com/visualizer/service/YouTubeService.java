package com.visualizer.service;

import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class YouTubeService {

    public String getAudioStreamUrl(String videoId) throws Exception {
        // Basic validation for video ID format
        if (videoId == null || videoId.trim().isEmpty() || !isValidVideoId(videoId)) {
            throw new IllegalArgumentException("Invalid YouTube video ID");
        }

        String videoUrl = "https://www.youtube.com/watch?v=" + videoId;
        
        // Command to execute yt-dlp.
        // -g: get URL
        // -f 140: audio format m4a (aac) 
        ProcessBuilder processBuilder = new ProcessBuilder(
                "yt-dlp",
                "-g",
                "-f", "140",
                videoUrl
        );

        processBuilder.redirectErrorStream(true); // Merge stderr into stdout so we can log/read it if needed

        Process process = processBuilder.start();

        StringBuilder output = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line).append("\n");
            }
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            System.err.println("yt-dlp failed with exit code: " + exitCode);
            System.err.println("Output: " + output.toString());
            throw new RuntimeException("Failed to extract stream URL. Ensure yt-dlp is installed and configured correctly.");
        }

        String url = output.toString().trim();
        if (url.contains("\n")) {
            url = url.split("\n")[0];
        }

        if (url.isEmpty() || !url.startsWith("http")) {
            throw new RuntimeException("Invalid URL extracted by yt-dlp.");
        }

        return url;
    }

    public void streamAudio(String videoId, java.io.OutputStream os) throws Exception {
        if (videoId == null || videoId.trim().isEmpty() || !isValidVideoId(videoId)) {
            throw new IllegalArgumentException("Invalid YouTube video ID");
        }

        String videoUrl = "https://www.youtube.com/watch?v=" + videoId;
        ProcessBuilder processBuilder = new ProcessBuilder(
                "yt-dlp",
                "-f", "140",
                "-o", "-",
                videoUrl
        );

        Process process = processBuilder.start();

        try (java.io.InputStream is = process.getInputStream()) {
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = is.read(buffer)) != -1) {
                os.write(buffer, 0, bytesRead);
            }
        }
        
        process.waitFor();
    }

    private boolean isValidVideoId(String videoId) {
        Pattern pattern = Pattern.compile("^[a-zA-Z0-9_-]{11}$");
        Matcher matcher = pattern.matcher(videoId);
        return matcher.matches();
    }
}
