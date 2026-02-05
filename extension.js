import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import Gvc from 'gi://Gvc';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as Slider from 'resource:///org/gnome/shell/ui/slider.js';

export default class ReplaceVolumeSlider extends Extension {
    enable() {
        this._mixerControl = new Gvc.MixerControl({ name: 'ReplaceVolumeSlider' });
        
        this._newSlider = null;
        this._targetContainer = null;
        this._originalSlider = null;
        this._sliderIndex = -1;
        this._currentStream = null;
        
        this._throttleMs = 25;      
        this._lastUpdate = 0;
        
        this._dragging = false;
        this._lastTouchTime = 0;   
        this._guardTimeMs = 1500;   

        this._signals = {
            mixerState: 0,
            mixerSink: 0,
            streamVol: 0,
            streamMute: 0
        };

        this._signals.mixerState = this._mixerControl.connect('state-changed', this._init.bind(this));
        this._signals.mixerSink = this._mixerControl.connect('default-sink-changed', this._updateStream.bind(this));
        this._mixerControl.open();
    }

    disable() {
        this._cleanupStreamSignals();

        if (this._mixerControl) {
            if (this._signals.mixerState) this._mixerControl.disconnect(this._signals.mixerState);
            if (this._signals.mixerSink) this._mixerControl.disconnect(this._signals.mixerSink);
            this._mixerControl.close();
            this._mixerControl = null;
        }

        if (this._targetContainer && this._originalSlider) {
            if (this._newSlider) {
                this._targetContainer.remove_child(this._newSlider);
                this._newSlider.destroy();
                this._newSlider = null;
            }
            this._targetContainer.insert_child_at_index(this._originalSlider, this._sliderIndex);
            
            try {
                const qs = Main.panel.statusArea.quickSettings;
                const volumeRow = qs._volumeOutput || qs._volume;
                if (volumeRow && volumeRow._output) {
                    volumeRow._output.slider = this._originalSlider;
                }
            } catch(e) {}
        }
    }

    _init() {
        if (this._newSlider) return;
        if (this._mixerControl.get_state() !== Gvc.MixerControlState.READY) return;

        const qs = Main.panel.statusArea.quickSettings;
        const volumeRow = qs._volumeOutput || qs._volume;
        if (!volumeRow) return;

        let quickSlider = volumeRow._output;
        if (!quickSlider && volumeRow.get_children) {
            const children = volumeRow.get_children();
            quickSlider = children.find(c => c.constructor.name === 'QuickSlider');
        }
        if (!quickSlider) return;

        this._originalSlider = quickSlider.slider;
        if (!this._originalSlider) {
            const kids = quickSlider.get_children();
            this._originalSlider = kids.find(k => k instanceof Slider.Slider);
        }
        if (!this._originalSlider) return;

        this._targetContainer = this._originalSlider.get_parent();
        const siblings = this._targetContainer.get_children();
        this._sliderIndex = siblings.indexOf(this._originalSlider);

        this._targetContainer.remove_child(this._originalSlider);

        this._newSlider = new Slider.Slider(0);
        this._newSlider.x_expand = true;
        this._newSlider.y_expand = true;
        
        if (this._originalSlider.accessible_name) {
            this._newSlider.accessible_name = this._originalSlider.accessible_name;
        }

        this._targetContainer.insert_child_at_index(this._newSlider, this._sliderIndex);

        try { quickSlider.slider = this._newSlider; } catch (e) {}

        this._setupLogic();
        this._updateStream();
    }

    _setupLogic() {
        this._dragging = false;

        this._newSlider.connect('drag-begin', () => { 
            this._dragging = true; 
            this._lastTouchTime = Date.now();
        });

        this._newSlider.connect('drag-end', () => {
            this._dragging = false;
            this._lastTouchTime = Date.now();
            this._setVolumeInternal(this._newSlider.value);
        });

        this._newSlider.connect('notify::value', () => {
            if (!this._dragging) return;

            this._lastTouchTime = Date.now();

            const now = Date.now();
            if (now - this._lastUpdate < this._throttleMs) return;
            this._lastUpdate = now;

            this._setVolumeInternal(this._newSlider.value);
        });
    }

    _setVolumeInternal(value) {
        if (!this._currentStream) return;

        const max = this._mixerControl.get_vol_max_norm(); 
        let vol = Math.round(value * max);
        
        if (vol < 0) vol = 0;
        if (vol > max) vol = max;

        if (this._currentStream.volume === vol) return;
        
        const diff = Math.abs(this._currentStream.volume - vol);
        if (this._dragging && diff < 150) return; 

        this._currentStream.volume = vol;
        this._currentStream.push_volume();
    }

    _updateStream() {
        if (!this._newSlider) return;
        this._cleanupStreamSignals();

        const stream = this._mixerControl.get_default_sink();
        if (stream) {
            this._currentStream = stream;
            
            this._signals.streamVol = stream.connect('notify::volume', () => this._sync());
            this._signals.streamMute = stream.connect('notify::is-muted', () => this._sync());
            
            this._sync();
        }
    }

    _sync() {
        if (!this._currentStream || !this._newSlider) return;
        
        if (this._dragging) return;
        if (Date.now() - this._lastTouchTime < this._guardTimeMs) return;

        const max = this._mixerControl.get_vol_max_norm();
        if (max > 0) {
            this._newSlider.value = this._currentStream.volume / max;
        }
    }

    _cleanupStreamSignals() {
        if (this._currentStream) {
            if (this._signals.streamVol) {
                try { this._currentStream.disconnect(this._signals.streamVol); } catch(e) {}
                this._signals.streamVol = 0;
            }
            if (this._signals.streamMute) {
                try { this._currentStream.disconnect(this._signals.streamMute); } catch(e) {}
                this._signals.streamMute = 0;
            }
            this._currentStream = null;
        }
    }
}
