# 🎵 Audio Visualizer Web App

A full-stack, visually stunning web application that fetches audio streams directly from YouTube videos (or YouTube Music) and creates a beautifully dynamic real-time audio visualization using `p5.js`.

---

## 🌟 Features
- **Smart URL Parsing:** Automatically detects standard YouTube URLs, YouTube Music links, or standard 11-byte video IDs right from the input box.
- **Bulletproof Backend Proxy:** Engineered in Java/Spring Boot using `ProcessBuilder` and `yt-dlp` to stream raw audio bytes straight to the client browser's AudioContext. Bypasses client-side CORS issues and frustrating browser restriction limits.
- **Audio-Reactive Visualizer:** Built natively with Vanilla HTML, beautiful CSS, and `p5.js`. Analyzes frequencies dynamically:
  - 💓 Central pulsating blobs reacting precisely to Bass and Mid frequencies.
  - 🌈 Dynamic neon outer rims rendering the full frequency spectrum radially via `p5.FFT()`.

---

## 🛠 Prerequisites

Before starting, ensure you have the following tools installed on your machine so the project can build and stream correctly:

1. **Java 17 (or higher)**
   Verify your version on your command line via: `java -version`

2. **Apache Maven**
   Verify your maven builder via: `mvn -version`

3. **yt-dlp**
   The backend leverages `yt-dlp` natively to extract standard raw audio streams. **You must have it installed and available in your system's PATH!**
   - **macOS:** `brew install yt-dlp`
   - **Debian/Ubuntu:** `sudo apt install yt-dlp` or install via Python `pip3 install yt-dlp`
   - **Windows:** Download the `.exe` from the [yt-dlp GitHub Releases](https://github.com/yt-dlp/yt-dlp/releases) and add it to your Environment Variables PATH.
   
   Verify your installation via: `yt-dlp --version`

---

## 🚀 Getting Started

Follow these steps to run the Audio Visualizer locally:

**1. Clone the repository**

```bash
git clone https://github.com/your-username/playTheMusic.git
cd playTheMusic
```

**2. Build the Application**  
Compile the Java Application bridging both backend code and the static frontend resources into the `target/` directory:
```bash
mvn clean install
```

**3. Run the Spring Boot Server**  
Start up the web server locally (running on port `8080`):
```bash
mvn spring-boot:run
```

**4. Start Visualizing**  
Once the terminal logs state initialization is complete (e.g. `Tomcat started on port 8080`), open your web browser and navigate to:  
👉 [http://localhost:8080](http://localhost:8080)

---

## 🎧 Usage
1. Open up YouTube or YouTube Music on a separate tab.
2. Find an exciting song to visualize!
3. Copy the URL from the browser (e.g. `https://music.youtube.com/watch?v=M3wWKp5JCMY...`).
4. Switch back to the Audio Visualizer application and paste the URL directly into the text input.
5. Hit **"LOAD & PLAY"**. 
6. Allow the backend proxy buffer a couple of seconds to connect, wait for the drop, and enjoy the visualizer! *(Tip: If you ever need to change the song, just click anywhere on the visualization background to bring the interactive UI back up).*

---

## 📜 License
This architecture utilizes `p5.js` alongside Java/Spring Boot logic.
