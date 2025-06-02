import Hls from "hls.js";

document.addEventListener("DOMContentLoaded", function () {
  const video = document.getElementById("video") as HTMLVideoElement;
  const playPauseButton = document.getElementById("play-pause") as HTMLButtonElement;
  const playIcon = document.querySelector(".play-icon") as HTMLElement;
  const pauseIcon = document.querySelector(".pause-icon") as HTMLElement;
  const loadingIndicator = document.querySelector(".loading-indicator") as HTMLElement;
  const progressBar = document.querySelector(".progress-bar") as HTMLElement;
  const progressFilled = document.querySelector(".progress-filled") as HTMLElement;
  const currentTimeElement = document.getElementById("current-time");
  const durationElement = document.getElementById("duration");
  const rewindButton = document.getElementById("rewind") as HTMLButtonElement;
  const fastForwardButton = document.getElementById("fast-forward") as HTMLButtonElement;
  const volumeButton = document.getElementById("volume") as HTMLButtonElement;
  const muteIcon = document.querySelector(".mute-icon") as HTMLElement;
  const volumeHighIcon = document.querySelector(".volume-high-icon") as HTMLElement;
  const volumeIcon = document.querySelector(".volume-icon") as HTMLElement;
  const volumeSlider = document.getElementById("volume-slider") as HTMLInputElement;
  const qualityButton = document.getElementById("quality-button") as HTMLButtonElement;
  const qualityMenu = document.querySelector(".quality-menu") as HTMLElement;
  const videoContainer = document.querySelector(".video-container") as HTMLElement;
  const controls = document.querySelector(".controls") as HTMLElement;

  let isMuted = false;
  let hlsInstance: Hls | null = null;

  // Helper function to update play/pause UI
  function updatePlayPauseUI(playing: boolean): void {
    playIcon.style.display = playing ? "none" : "block";
    pauseIcon.style.display = playing ? "block" : "none";
  }
  // Play/pause functionality
  playPauseButton.addEventListener("click", function () {
    if (video.paused) {
      video.play().catch((e) => console.error("Error playing video:", e));
      updatePlayPauseUI(true);
    } else {
      video.pause();
      updatePlayPauseUI(false);
    }
  });
  //  Show loading indicator when video is loading
  video.addEventListener("waiting", function () {
    loadingIndicator.classList.remove("hidden");
  });

  video.addEventListener("playing", function () {
    loadingIndicator.classList.add("hidden");
  });

  // Format time to mm:ss
  function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  }
  // Update time display
  function updateProgress(): void {
    // Update time display
    if (currentTimeElement) {
      currentTimeElement.textContent = formatTime(video.currentTime);
    }
    if (!isNaN(video.duration) && durationElement) {
      durationElement.textContent = formatTime(video.duration);
    }
    // Update progress bar
    const percent = (video.currentTime / video.duration) * 100;
    progressFilled.style.width = `${percent}%`;
  }
  // Initialize time display
  video.addEventListener("loadedmetadata", function () {
    if (currentTimeElement) {
      currentTimeElement.textContent = "0:00";
    }
    if (durationElement) {
      durationElement.textContent = formatTime(video.duration);
    }
  });
  video.addEventListener("timeupdate", updateProgress);
  // Click on progress bar to seek
  progressBar.addEventListener("click", seek);
  // Seeking function
  function seek(e: MouseEvent): void {
    const progressBarRect = progressBar.getBoundingClientRect();
    const seekTime =
      ((e.clientX - progressBarRect.left) / progressBarRect.width) *
      video.duration;
    video.currentTime = seekTime;
  }

  // Handle seeking errors
  progressBar.addEventListener("click", function (e: MouseEvent) {
    try {
      seek(e);
    } catch (error) {
      console.error("Error while seeking:", error);
    }
  });
  // Rewind functionality
  rewindButton.addEventListener("click", function () {
    video.currentTime -= 10; // Rewind by 10 seconds
  });
  // Fast forward functionality
  fastForwardButton.addEventListener("click", function () {
    video.currentTime += 10; // Fast forward by 10 seconds
  });

  // Helper function to update volume UI based on current state
  function updateVolumeUI(): void {
    if (video.muted || video.volume === 0) {
      isMuted = true;
      muteIcon.style.display = "block";
      volumeHighIcon.style.display = "none";
      volumeIcon.style.display = "none";
      volumeSlider.value = "0";
    } else if (video.volume < 0.5) {
      isMuted = false;
      muteIcon.style.display = "none";
      volumeHighIcon.style.display = "none";
      volumeIcon.style.display = "block";
      volumeSlider.value = String(video.volume);
    } else {
      isMuted = false;
      muteIcon.style.display = "none";
      volumeHighIcon.style.display = "block";
      volumeIcon.style.display = "none";
      volumeSlider.value = String(video.volume);
    }
  }
  // Helper function to toggle mute state
  function toggleMute(mute: boolean): void {
    if (mute) {
      // Muting
      video.dataset.previousVolume = volumeSlider.value;
      video.muted = true;
    } else {
      // Unmuting
      video.muted = false;
      // Make sure we have a reasonable volume when unmuting if it was at 0
      if (parseFloat(volumeSlider.value) === 0) {
        video.volume = 0.5;
      } else {
        video.volume = parseFloat(volumeSlider.value);
      }
    }
    updateVolumeUI();
  }
  // Volume button functionality
  volumeButton.addEventListener("click", function () {
    toggleMute(!isMuted);
  });
  // Add event listener for volume slider
  volumeSlider.addEventListener("input", function (this: HTMLInputElement) {
    video.volume = parseFloat(this.value);
    if (this.value === "0") {
      video.muted = true;
    } else {
      video.muted = false;
    }
    updateVolumeUI();
  });
  //Find the source element with type="application/x-mpegURL"
  function getHlsSource() {
    const sources = video.querySelectorAll("source");
    for (const source of sources) {
      if (source.type === "application/x-mpegURL") {
        return source.src;
      }
    }
    return null; // Return null if no HLS source is found
  }
  const hlsSource = getHlsSource();

  if (hlsSource) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      video.src = hlsSource;
      console.log("Native HLS support detected, using video.src");
      // Note: Quality selection is limited with native HLS
      if (qualityButton) {
        qualityButton.style.display = "none"; // Hide quality button for native playback
      }
    } else if (Hls.isSupported()) {
      // HLS.js support
      hlsInstance = new Hls({
        debug: false,
        autoStartLoad: true,
        startLevel: -1, // Start with auto quality selection
        defaultAudioCodec: "mp4a.40.2",
      });

      hlsInstance.loadSource(hlsSource);
      hlsInstance.attachMedia(video);

      // Handle HLS events for quality levels
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
        // Create quality options in the menu
        populateQualityMenu(data.levels);
      });

      // Handle level switching
      hlsInstance.on(Hls.Events.LEVEL_SWITCHED, function (event, data) {
        if (!hlsInstance) return;

        const currentLevel = data.level;
        updateActiveQuality(currentLevel);
      });
    } else {
      console.warn("HLS is not supported in this browser");
      // Fallback to regular video with original source
    }
  }
  // Function to create quality menu items
  function populateQualityMenu(levels: any[]) {
    // Clear existing menu items except auto
    const qualityOptions = qualityMenu.querySelectorAll(
      '.quality-option:not([data-quality="auto"])'
    );
    qualityOptions.forEach((option) => option.remove());

    // Add options for each quality level
    levels.forEach((level, index) => {
      const option = document.createElement("div");
      option.className = "quality-option";
      option.dataset.quality = String(index);

      // Format display text based on available metadata
      if (level.height) {
        option.textContent = `${level.height}p`;
        if (level.bitrate) {
          option.textContent += ` (${Math.round(level.bitrate / 1000)} kbps)`;
        }
      } else {
        option.textContent = `Level ${index + 1}`;
      }

      option.addEventListener("click", () => {
        setQualityLevel(index);
        hideQualityMenu();
      });

      qualityMenu.appendChild(option);
    });

    // Add event listener for auto quality
    const autoOption = qualityMenu.querySelector(
      '[data-quality="auto"]'
    ) as HTMLElement;
    if (autoOption) {
      autoOption.addEventListener("click", () => {
        setQualityLevel(-1);
        hideQualityMenu();
      });

      // Mark auto as active initially
      autoOption.classList.add("active");
    }
  }
  // Function to set quality level
  function setQualityLevel(level: number) {
    if (hlsInstance) {
      hlsInstance.currentLevel = level; // Set the current level
      console.log(`Quality level set to: ${level}`);
    }
  }
  // Function to update which quality is marked as active
  function updateActiveQuality(level: number) {
    if (!hlsInstance) return;

    const options = qualityMenu.querySelectorAll(".quality-option");
    options.forEach((option) => {
      option.classList.remove("active");
    });

    if (level === -1) {
      // Auto mode
      const autoOption = qualityMenu.querySelector('[data-quality="auto"]');
      if (autoOption) {
        autoOption.classList.add("active");
      }
      qualityButton.setAttribute("title", "Auto Quality");
    } else {
      // Specific level
      const activeOption = qualityMenu.querySelector(
        `[data-quality="${level}"]`
      );
      if (activeOption) {
        activeOption.classList.add("active");
        qualityButton.setAttribute(
          "title",
          `Quality: ${activeOption.textContent}`
        );
      }
    }
  }
  // Toggle quality menu
  qualityButton.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (qualityMenu.classList.contains("hidden")) {
      showQualityMenu();
    } else {
      hideQualityMenu();
    }
  });

  function showQualityMenu() {
    qualityMenu.classList.remove("hidden");

    // Add click outside listener to close the menu
    setTimeout(() => {
      document.addEventListener("click", closeQualityMenuOnClickOutside);
    }, 10);
  }

  function hideQualityMenu() {
    qualityMenu.classList.add("hidden");
    document.removeEventListener("click", closeQualityMenuOnClickOutside);
  }

  function closeQualityMenuOnClickOutside(e: MouseEvent) {
    if (
      qualityButton &&
      qualityMenu &&
      !qualityButton.contains(e.target as Node) &&
      !qualityMenu.contains(e.target as Node)
    ) {
      hideQualityMenu();
    }
  }

  // Add keyboard support
  document.addEventListener("keydown", function (e: KeyboardEvent) {
    // Space bar: Play/Pause
    if (
      e.code === "Space" &&
      document.activeElement instanceof HTMLElement &&
      document.activeElement.tagName !== "BUTTON"
    ) {
      e.preventDefault();
      playPauseButton.click();
    }
    // Left arrow: Rewind
    else if (e.code === "ArrowLeft") {
      e.preventDefault();
      video.currentTime -= 5;
    }
    // Right arrow: Fast forward
    else if (e.code === "ArrowRight") {
      e.preventDefault();
      video.currentTime += 5;
    }
    // Up arrow: Volume up
    else if (e.code === "ArrowUp") {
      e.preventDefault();
      video.volume = Math.min(1, video.volume + 0.1);
    }
    // Down arrow: Volume down
    else if (e.code === "ArrowDown") {
      e.preventDefault();
      video.volume = Math.max(0, video.volume - 0.1);
    }
    // M key: Mute/unmute
    else if (e.code === "KeyM") {
      e.preventDefault();
      volumeButton.click();
    }
    // Q key: Quality menu
    else if (e.code === "KeyQ") {
      e.preventDefault();
      qualityButton.click();
    }
  });
  // show video controls on mouse move
  videoContainer.addEventListener("mousemove", showControls);
  videoContainer.addEventListener("mouseleave", hideControls);

  function showControls() {
    controls.style.opacity = "1";
  }

  function hideControls() {
    if (!video.paused) {
      controls.style.opacity = "0";
    }
  }
});
