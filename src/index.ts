import Hls from "hls.js";

document.addEventListener("DOMContentLoaded", function () {
  const video = document.getElementById("video") as HTMLVideoElement;
  const playPauseButton = document.getElementById(
    "play-pause"
  ) as HTMLButtonElement;
  const volumeButton = document.getElementById("volume") as HTMLButtonElement;
  const rewindButton = document.getElementById("rewind") as HTMLButtonElement;
  const fastForwardButton = document.getElementById(
    "fast-forward"
  ) as HTMLButtonElement;
  const muteIcon = document.querySelector(".mute-icon") as HTMLElement;
  const volumeHighIcon = document.querySelector(
    ".volume-high-icon"
  ) as HTMLElement;
  const volumeIcon = document.querySelector(".volume-icon") as HTMLElement;
  const playIcon = document.querySelector(".play-icon") as HTMLElement;
  const pauseIcon = document.querySelector(".pause-icon") as HTMLElement;
  const volumeSlider = document.getElementById(
    "volume-slider"
  ) as HTMLInputElement;
  const progressBar = document.querySelector(".progress-bar") as HTMLElement;
  const progressFilled = document.querySelector(
    ".progress-filled"
  ) as HTMLElement;
  const currentTimeElement = document.getElementById("current-time");
  const durationElement = document.getElementById("duration");
  const qualityButton = document.getElementById(
    "quality-button"
  ) as HTMLButtonElement;
  const qualityMenu = document.querySelector(".quality-menu") as HTMLElement;
  let isMuted = false;
  let isPlaying = false;
  let hlsInstance: Hls | null = null;

  // Helper function to update play/pause UI
  function updatePlayPauseUI(playing: boolean): void {
    isPlaying = playing;
    playIcon.style.display = playing ? "none" : "block";
    pauseIcon.style.display = playing ? "block" : "none";
  }

  // Helper function to update volume icon UI
  // function updateVolumeUI(): void {
  //   if (video.muted || video.volume === 0) {
  //     isMuted = true;
  //     muteIcon.style.display = "block";
  //     volumeHighIcon.style.display = "none";
  //     volumeIcon.style.display = "none";
  //     volumeSlider.value = "0";
  //   } else if (video.volume < 0.5) {
  //     isMuted = false;
  //     muteIcon.style.display = "none";
  //     volumeHighIcon.style.display = "none";
  //     volumeIcon.style.display = "block";
  //     volumeSlider.value = String(video.volume);
  //   } else {
  //     isMuted = false;
  //     muteIcon.style.display = "none";
  //     volumeHighIcon.style.display = "block";
  //     volumeIcon.style.display = "none";
  //     volumeSlider.value = String(video.volume);
  //   }
  // }

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

  // Volume button functionality
  volumeButton.addEventListener("click", function () {
    if (isMuted) {
      // Unmuting
      video.muted = false;
      isMuted = false;

      // Make sure we have a reasonable volume when unmuting if it was at 0
      if (parseFloat(volumeSlider.value) === 0) {
        volumeSlider.value = "0.5";
        video.volume = 0.5;
      } else {
        // Restore volume from slider
        video.volume = parseFloat(volumeSlider.value);
      }

      // Update icon display based on actual volume
      if (video.volume < 0.5) {
        muteIcon.style.display = "none";
        volumeHighIcon.style.display = "none";
        volumeIcon.style.display = "block";
      } else {
        muteIcon.style.display = "none";
        volumeHighIcon.style.display = "block";
        volumeIcon.style.display = "none";
      }
    } else {
      // Muting
      video.muted = true;
      isMuted = true;
      muteIcon.style.display = "block";
      volumeHighIcon.style.display = "none";
      volumeIcon.style.display = "none";

      // Store the current volume value before visually setting to 0
      video.dataset.previousVolume = volumeSlider.value;
      // Make the slider show 0 when muted
      volumeSlider.value = "0";
    }
  });

  // Fast forward functionality
  fastForwardButton.addEventListener("click", function () {
    video.currentTime += 10; // Fast forward by 10 seconds
  });

  // Rewind functionality
  rewindButton.addEventListener("click", function () {
    video.currentTime -= 10; // Rewind by 10 seconds
  });

  // Add event listener for volume slider
  volumeSlider.addEventListener("input", function (this: HTMLInputElement) {
    video.volume = parseFloat(this.value);

    // Update mute state based on volume
    if (this.value === "0") {
      video.muted = true;
      isMuted = true;
      muteIcon.style.display = "block";
      volumeHighIcon.style.display = "none";
      volumeIcon.style.display = "none";
    } else {
      video.muted = false;
      isMuted = false;

      // Show appropriate volume icon
      if (parseFloat(this.value) < 0.5) {
        muteIcon.style.display = "none";
        volumeHighIcon.style.display = "none";
        volumeIcon.style.display = "block";
      } else {
        muteIcon.style.display = "none";
        volumeHighIcon.style.display = "block";
        volumeIcon.style.display = "none";
      }
    }
  });

  // Update the volume slider when volumechange event is triggered
  video.addEventListener("volumechange", function () {
    if (video.muted || video.volume === 0) {
      isMuted = true;
      muteIcon.style.display = "block";
      volumeHighIcon.style.display = "none";
      volumeIcon.style.display = "none";

      // Show slider at 0 when muted
      volumeSlider.value = "0";
    } else if (video.volume > 0 && video.volume < 1) {
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
  });

  // Initialize slider with current volume
  volumeSlider.value = String(video.volume);

  // Initialize icons
  if (video.muted || video.volume === 0) {
    isMuted = true;
    muteIcon.style.display = "block";
    volumeHighIcon.style.display = "none";
    volumeIcon.style.display = "none";
  } else if (video.volume > 0 && video.volume < 1) {
    isMuted = false;
    muteIcon.style.display = "none";
    volumeHighIcon.style.display = "none";
    volumeIcon.style.display = "block";
  } else {
    isMuted = false;
    muteIcon.style.display = "none";
    volumeHighIcon.style.display = "block";
    volumeIcon.style.display = "none";
  }

  if (video.paused) {
    isPlaying = false;
    playIcon.style.display = "block";
    pauseIcon.style.display = "none";
  } else {
    isPlaying = true;
    playIcon.style.display = "none";
    pauseIcon.style.display = "block";
  }

  // Format time to mm:ss
  function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  }

  // Update progress bar and time display
  function updateProgress(): void {
    const percent = (video.currentTime / video.duration) * 100;
    progressFilled.style.width = `${percent}%`;

    // Update time display
    if (currentTimeElement) {
      currentTimeElement.textContent = formatTime(video.currentTime);
    }
    if (!isNaN(video.duration) && durationElement) {
      durationElement.textContent = formatTime(video.duration);
    }
  }

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

  // Initialize time display
  video.addEventListener("loadedmetadata", function () {
    if (currentTimeElement) {
      currentTimeElement.textContent = "0:00";
    }
    if (durationElement) {
      durationElement.textContent = formatTime(video.duration);
    }
  });

  // Update progress bar as video plays
  video.addEventListener("timeupdate", updateProgress);

  // Handle seeking errors
  progressBar.addEventListener("click", function (e: MouseEvent) {
    try {
      seek(e);
    } catch (error) {
      console.error("Error while seeking:", error);
    }
  });

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

  // Method 1: Find the source element with type="application/x-mpegURL"
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
        console.log("Available quality levels:", data.levels);

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
        // if (level.bitrate) {
        //   option.textContent += ` (${Math.round(level.bitrate / 1000)} kbps)`;
        // }
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
    if (!hlsInstance) return;

    hlsInstance.currentLevel = level;
    updateActiveQuality(level);
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


  const videoContainer = document.querySelector(".video-container") as HTMLElement;
const controls = document.querySelector(".controls") as HTMLElement;

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
  
  const loadingIndicator = document.querySelector(".loading-indicator") as HTMLElement;

video.addEventListener("waiting", function() {
  loadingIndicator.classList.remove("hidden");
});

video.addEventListener("playing", function() {
  loadingIndicator.classList.add("hidden");
});
});
