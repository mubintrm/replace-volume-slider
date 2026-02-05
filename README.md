# Replace Volume Slider (GNOME Extension)

A high-performance volume slider for GNOME Shell Quick Settings.

**The Problem:**
The stock GNOME volume slider can cause stuttering, audio crackling, and UI freezes because it floods the audio server (PipeWire/PulseAudio) with hundreds of update commands per second while dragging.

**The Solution:**
This extension replaces the stock slider with an optimized implementation that:
* **Throttles audio commands** to ~40Hz (perfectly smooth for hearing, safe for the server).
* **Decouples the UI:** The slider moves instantly at your monitor's full refresh rate (60Hz, 144Hz, 240Hz, etc.) without waiting for the audio server.
* **Uses native Gvc integration** for zero overhead.
* **Prevents "snap-back" glitches** during rapid volume changes.

### Installation

**Manual Installation:**
1. Clone this repository.
2. Copy the folder to `~/.local/share/gnome-shell/extensions/replace-volume-slider@MubinTR`.
3. Log out and log back in.
4. Enable via the Extensions app.

### Compatibility
* GNOME 45 - 49+

### License
GPL-3.0
