# Replace Volume Slider (GNOME Extension)

A high-performance volume slider for GNOME Shell Quick Settings.

Without Extension:
![buggedslider1](https://github.com/user-attachments/assets/bac6362a-3fd9-4fab-9bf6-b63ae050bcf2)

With Extension:
![fixedslider](https://github.com/user-attachments/assets/239f2a07-3d54-4b62-a003-2ddcde13de6b)

**The Problem:**
The stock GNOME volume slider often gets "stuck," freezes, or lags when dragged quickly. This happens because the default implementation floods the audio server (PulseAudio/PipeWire) with synchronous update commands for every single pixel of movement. If the system cannot process them fast enough, the shell interface locks up until the audio server catches up.

**The Solution:**
This extension replaces the stock slider with a custom implementation that separates the visual UI from the audio backend:
* **Fixes the "Stuck Slider" Bug:** The slider always moves instantly and smoothly, no matter how fast you drag it.
* **Throttles Audio Calls:** Updates are sent to the audio server at a safe rate (~40Hz), preventing system floods while keeping the UI responsive.
* **Zero Lag:** Uses native `libgnome-volume-control` (Gvc) integration for maximum performance.

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
