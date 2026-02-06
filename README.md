# Replace Volume Slider (GNOME Extension)

A high-performance volume slider for GNOME Shell Quick Settings.

### The Problem
When dragging the stock GNOME volume slider quickly, two major issues often occur:
1.  **UI Freeze:** The slider gets "stuck" or lags behind the mouse cursor because the shell blocks while waiting for the audio backend.
2.  **Audio Lag/Stutter:** The sheer volume of updates floods the audio server (PipeWire/PulseAudio), causing the actual audio playback to stutter, crackle, or lag.

**Stock Behavior:**
![Stock GNOME Slider Bug](https://github.com/user-attachments/assets/bac6362a-3fd9-4fab-9bf6-b63ae050bcf2)
---
(Note: Audio also falls behind and lags normally, so you don't have to slide it like crazy as i did to realize the problem.)
---
### The Solution
This extension replaces the stock slider with an optimized implementation that decouples the visual UI from the backend:
* **Fixes Audio Lag:** Throttles backend updates to a safe rate (~40Hz), preventing the audio server from choking on command floods.
* **Fixes Sticky Slider:** The UI moves instantly at your monitor's full refresh rate, independent of the audio server's processing time.
* **Native Integration:** Uses `libgnome-volume-control` (Gvc) directly for zero overhead.

**Extension Behavior:**
![Fixed Slider Smooth](https://github.com/user-attachments/assets/239f2a07-3d54-4b62-a003-2ddcde13de6b)

### Installation

**Manual Installation:**
1. Clone this repository.
2. Copy the folder to `~/.local/share/gnome-shell/extensions/replace-volume-slider@MubinTR`.
3. Log out and log back in (or restart GNOME Shell).
4. Enable via the Extensions app.

### Compatibility
* GNOME 45 - 50+

### License
GPL-3.0
