// InsectBeats Studio - Main Application Logic

class InsectBeatsStudio {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.currentPosition = 0;
        this.tempo = 120;
        this.tracks = Array(6).fill(null).map(() => ({
            clips: [],
            volume: 75,
            pan: 0,
            muted: false,
            solo: false,
            effects: {
                reverb: 20,
                delay: 0,
                highEq: 0,
                midEq: 0,
                lowEq: 0
            }
        }));
        this.selectedTrack = 0;
        this.playheadPosition = 0;
        this.zoom = 1;
        this.looping = false;
        
        this.insectData = {
            "insectSounds": [
                {
                    "category": "Crickets",
                    "sounds": [
                        {"name": "Night Cricket", "duration": "0:03", "frequency": 440, "type": "chirp"},
                        {"name": "Field Cricket", "duration": "0:04", "frequency": 520, "type": "chirp"},
                        {"name": "House Cricket", "duration": "0:02", "frequency": 380, "type": "chirp"},
                        {"name": "Cricket Chorus", "duration": "0:08", "frequency": 460, "type": "chorus"},
                        {"name": "Quiet Cricket", "duration": "0:05", "frequency": 340, "type": "soft"},
                        {"name": "Fast Cricket", "duration": "0:02", "frequency": 580, "type": "rapid"}
                    ]
                },
                {
                    "category": "Cicadas",
                    "sounds": [
                        {"name": "Summer Cicada", "duration": "0:10", "frequency": 800, "type": "buzz"},
                        {"name": "Jungle Cicada", "duration": "0:12", "frequency": 920, "type": "buzz"},
                        {"name": "Evening Cicada", "duration": "0:08", "frequency": 680, "type": "buzz"},
                        {"name": "Cicada Swarm", "duration": "0:15", "frequency": 750, "type": "swarm"},
                        {"name": "Distant Cicada", "duration": "0:06", "frequency": 600, "type": "soft"}
                    ]
                },
                {
                    "category": "Bees",
                    "sounds": [
                        {"name": "Worker Bee", "duration": "0:04", "frequency": 250, "type": "buzz"},
                        {"name": "Bee Swarm", "duration": "0:08", "frequency": 220, "type": "swarm"},
                        {"name": "Flying Bee", "duration": "0:03", "frequency": 280, "type": "buzz"},
                        {"name": "Hive Activity", "duration": "0:12", "frequency": 240, "type": "hive"}
                    ]
                },
                {
                    "category": "Grasshoppers",
                    "sounds": [
                        {"name": "Meadow Hopper", "duration": "0:02", "frequency": 1200, "type": "click"},
                        {"name": "Large Grasshopper", "duration": "0:03", "frequency": 900, "type": "click"},
                        {"name": "Hopper Chorus", "duration": "0:06", "frequency": 1100, "type": "chorus"}
                    ]
                },
                {
                    "category": "Mixed",
                    "sounds": [
                        {"name": "Night Symphony", "duration": "0:20", "frequency": 500, "type": "mixed"},
                        {"name": "Summer Evening", "duration": "0:18", "frequency": 450, "type": "mixed"},
                        {"name": "Forest Ambience", "duration": "0:25", "frequency": 400, "type": "mixed"}
                    ]
                }
            ],
            "backgroundSounds": [
                {
                    "category": "Ambient",
                    "sounds": [
                        {"name": "Forest Night", "duration": "1:00", "frequency": 200, "type": "ambient"},
                        {"name": "Meadow Dawn", "duration": "0:45", "frequency": 180, "type": "ambient"},
                        {"name": "Deep Woods", "duration": "1:20", "frequency": 150, "type": "ambient"},
                        {"name": "Peaceful Stream", "duration": "0:50", "frequency": 220, "type": "ambient"}
                    ]
                },
                {
                    "category": "Electronic",
                    "sounds": [
                        {"name": "Soft Pad", "duration": "0:30", "frequency": 100, "type": "electronic"},
                        {"name": "Chill Beat", "duration": "0:16", "frequency": 80, "type": "electronic"},
                        {"name": "Ambient Drone", "duration": "1:10", "frequency": 60, "type": "electronic"},
                        {"name": "Synth Texture", "duration": "0:40", "frequency": 120, "type": "electronic"}
                    ]
                },
                {
                    "category": "Nature",
                    "sounds": [
                        {"name": "Gentle Wind", "duration": "0:35", "frequency": 300, "type": "nature"},
                        {"name": "Distant Birds", "duration": "0:28", "frequency": 800, "type": "nature"},
                        {"name": "Rustling Leaves", "duration": "0:22", "frequency": 400, "type": "nature"},
                        {"name": "Water Drops", "duration": "0:15", "frequency": 600, "type": "nature"}
                    ]
                }
            ]
        };

        this.init();
    }

    init() {
        this.setupAudioWarning();
        this.setupEventListeners();
        this.populateSoundLibrary();
        this.setupTimeline();
        this.setupTracks();
        this.setupEffectsPanel();
        this.updateDisplay();
    }

    setupAudioWarning() {
        const audioWarning = document.getElementById('audioWarning');
        if (audioWarning) {
            audioWarning.addEventListener('click', () => {
                this.initAudioContext();
                audioWarning.classList.add('hidden');
            });
        }
    }

    async initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            await this.audioContext.resume();
        }
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Tempo control
        const tempoSlider = document.getElementById('tempoSlider');
        if (tempoSlider) {
            tempoSlider.addEventListener('input', (e) => {
                this.tempo = parseInt(e.target.value);
                const tempoDisplay = document.getElementById('tempoDisplay');
                if (tempoDisplay) {
                    tempoDisplay.textContent = `${this.tempo} BPM`;
                }
            });
        }

        // Play/Pause controls
        const globalPlayPause = document.getElementById('globalPlayPause');
        const transportPlay = document.getElementById('transportPlay');
        const transportStop = document.getElementById('transportStop');
        const loopToggle = document.getElementById('loopToggle');
        const exportBtn = document.getElementById('exportBtn');

        if (globalPlayPause) {
            globalPlayPause.addEventListener('click', () => this.togglePlayPause());
        }
        if (transportPlay) {
            transportPlay.addEventListener('click', () => this.togglePlayPause());
        }
        if (transportStop) {
            transportStop.addEventListener('click', () => this.stop());
        }
        if (loopToggle) {
            loopToggle.addEventListener('click', () => this.toggleLoop());
        }

        // Zoom controls
        const zoomIn = document.getElementById('zoomIn');
        const zoomOut = document.getElementById('zoomOut');
        
        if (zoomIn) {
            zoomIn.addEventListener('click', () => this.adjustZoom(1.2));
        }
        if (zoomOut) {
            zoomOut.addEventListener('click', () => this.adjustZoom(0.8));
        }

        // Export button
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportProject());
        }
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Show/hide tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            if (content.id === `${tabName}-tab`) {
                content.classList.remove('hidden');
            } else {
                content.classList.add('hidden');
            }
        });
    }

    populateSoundLibrary() {
        this.populateInsects();
        this.populateBackgrounds();
    }

    populateInsects() {
        const container = document.getElementById('insectCategories');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.insectData.insectSounds.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'sound-category';
            
            categoryDiv.innerHTML = `
                <h4 class="category-title">${category.category}</h4>
                ${category.sounds.map(sound => `
                    <div class="sound-item" draggable="true" data-sound='${JSON.stringify(sound)}' data-category="${category.category}">
                        <button class="sound-preview">▶</button>
                        <div class="sound-info">
                            <div class="sound-name">${sound.name}</div>
                            <div class="sound-duration">${sound.duration}</div>
                        </div>
                    </div>
                `).join('')}
            `;
            
            container.appendChild(categoryDiv);
        });

        this.setupSoundItemEvents(container);
    }

    populateBackgrounds() {
        const container = document.getElementById('backgroundCategories');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.insectData.backgroundSounds.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'sound-category';
            
            categoryDiv.innerHTML = `
                <h4 class="category-title">${category.category}</h4>
                ${category.sounds.map(sound => `
                    <div class="sound-item" draggable="true" data-sound='${JSON.stringify(sound)}' data-category="${category.category}">
                        <button class="sound-preview">▶</button>
                        <div class="sound-info">
                            <div class="sound-name">${sound.name}</div>
                            <div class="sound-duration">${sound.duration}</div>
                        </div>
                    </div>
                `).join('')}
            `;
            
            container.appendChild(categoryDiv);
        });

        this.setupSoundItemEvents(container);
    }

    setupSoundItemEvents(container) {
        container.querySelectorAll('.sound-item').forEach(item => {
            // Preview button
            const previewBtn = item.querySelector('.sound-preview');
            if (previewBtn) {
                previewBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const soundData = JSON.parse(item.dataset.sound);
                    await this.previewSound(soundData);
                });
            }

            // Drag events
            item.addEventListener('dragstart', (e) => {
                if (e.dataTransfer) {
                    e.dataTransfer.setData('text/plain', item.dataset.sound);
                    e.dataTransfer.effectAllowed = 'copy';
                }
                item.classList.add('dragging');
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
        });
    }

    async previewSound(soundData) {
        if (!this.audioContext) {
            await this.initAudioContext();
        }

        this.synthesizeSound(soundData, 2.0); // 2 second preview
    }

    synthesizeSound(soundData, duration = null) {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Configure based on sound type
        const freq = soundData.frequency || 440;
        const soundDuration = duration || this.parseDuration(soundData.duration);

        switch (soundData.type) {
            case 'chirp':
            case 'click':
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + soundDuration);
                break;
            
            case 'buzz':
            case 'swarm':
            case 'hive':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                oscillator.frequency.linearRampToValueAtTime(freq * 1.1, this.audioContext.currentTime + soundDuration / 2);
                oscillator.frequency.linearRampToValueAtTime(freq, this.audioContext.currentTime + soundDuration);
                gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.01, this.audioContext.currentTime + soundDuration);
                break;

            case 'ambient':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                break;

            case 'electronic':
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
                break;

            case 'nature':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                // Add some randomness for nature sounds
                oscillator.frequency.linearRampToValueAtTime(freq * (1 + Math.random() * 0.2), this.audioContext.currentTime + soundDuration);
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                break;
            
            default:
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.01, this.audioContext.currentTime + soundDuration);
        }

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + soundDuration);
    }

    parseDuration(durationStr) {
        const parts = durationStr.split(':');
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }

    setupTimeline() {
        const ruler = document.getElementById('timelineRuler');
        if (!ruler) return;
        
        const beatsPerMeasure = 4;
        const pixelsPerBeat = 100 * this.zoom;
        
        ruler.innerHTML = '';
        
        for (let i = 0; i < 32; i++) {
            const marker = document.createElement('div');
            marker.className = `beat-marker ${i % beatsPerMeasure === 0 ? 'major' : ''}`;
            marker.style.left = `${i * pixelsPerBeat}px`;
            
            if (i % beatsPerMeasure === 0) {
                const beatNumber = document.createElement('div');
                beatNumber.className = 'beat-number';
                beatNumber.textContent = Math.floor(i / beatsPerMeasure) + 1;
                marker.appendChild(beatNumber);
            }
            
            ruler.appendChild(marker);
        }

        this.setupDragAndDrop();
    }

    setupTracks() {
        const tracksArea = document.getElementById('tracksArea');
        const trackControls = document.querySelector('.track-controls');
        
        if (!tracksArea || !trackControls) return;
        
        tracksArea.innerHTML = '';
        
        // Clear existing track controls (except header)
        const existingControls = trackControls.querySelectorAll('.track-control');
        existingControls.forEach(control => control.remove());
        
        for (let i = 0; i < 6; i++) {
            // Track lane
            const trackLane = document.createElement('div');
            trackLane.className = 'track-lane';
            trackLane.dataset.trackIndex = i;
            tracksArea.appendChild(trackLane);
            
            // Track control
            const trackControl = document.createElement('div');
            trackControl.className = 'track-control';
            trackControl.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 12px; color: #ccc;">Track ${i + 1}</span>
                </div>
                <div class="track-buttons">
                    <button class="track-btn mute-btn" data-track="${i}">M</button>
                    <button class="track-btn solo-btn" data-track="${i}">S</button>
                </div>
                <input type="range" class="track-volume" data-track="${i}" min="0" max="100" value="75">
            `;
            trackControls.appendChild(trackControl);
            
            // Track control events
            const muteBtn = trackControl.querySelector('.mute-btn');
            const soloBtn = trackControl.querySelector('.solo-btn');
            const volumeSlider = trackControl.querySelector('.track-volume');
            
            if (muteBtn) {
                muteBtn.addEventListener('click', () => {
                    this.tracks[i].muted = !this.tracks[i].muted;
                    muteBtn.classList.toggle('active', this.tracks[i].muted);
                });
            }
            
            if (soloBtn) {
                soloBtn.addEventListener('click', () => {
                    this.tracks[i].solo = !this.tracks[i].solo;
                    soloBtn.classList.toggle('active', this.tracks[i].solo);
                });
            }
            
            if (volumeSlider) {
                volumeSlider.addEventListener('input', (e) => {
                    this.tracks[i].volume = parseInt(e.target.value);
                });
            }
        }
    }

    setupDragAndDrop() {
        const trackLanes = document.querySelectorAll('.track-lane');
        
        trackLanes.forEach(lane => {
            lane.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                lane.classList.add('drag-over');
            });
            
            lane.addEventListener('dragleave', (e) => {
                // Only remove drag-over if we're actually leaving the lane
                if (!lane.contains(e.relatedTarget)) {
                    lane.classList.remove('drag-over');
                }
            });
            
            lane.addEventListener('drop', (e) => {
                e.preventDefault();
                lane.classList.remove('drag-over');
                
                try {
                    const soundData = JSON.parse(e.dataTransfer.getData('text/plain'));
                    const trackIndex = parseInt(lane.dataset.trackIndex);
                    const rect = lane.getBoundingClientRect();
                    const position = Math.max(0, (e.clientX - rect.left) / 100); // Convert to beats, ensure positive
                    
                    this.addClipToTrack(trackIndex, soundData, position);
                } catch (error) {
                    console.error('Error handling drop:', error);
                }
            });
        });
    }

    addClipToTrack(trackIndex, soundData, position) {
        const clipId = Date.now() + Math.random();
        const duration = this.parseDuration(soundData.duration);
        const pixelsPerSecond = 20;
        
        const clip = {
            id: clipId,
            soundData,
            position,
            duration
        };
        
        this.tracks[trackIndex].clips.push(clip);
        
        const trackLane = document.querySelector(`[data-track-index="${trackIndex}"]`);
        if (!trackLane) return;
        
        const clipElement = document.createElement('div');
        clipElement.className = 'audio-clip';
        clipElement.dataset.clipId = clipId;
        clipElement.style.left = `${position * 100}px`;
        clipElement.style.width = `${Math.max(60, duration * pixelsPerSecond)}px`;
        
        clipElement.innerHTML = `<div class="clip-name">${soundData.name}</div>`;
        
        clipElement.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.audio-clip').forEach(c => c.classList.remove('selected'));
            clipElement.classList.add('selected');
        });
        
        clipElement.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.removeClip(trackIndex, clipId);
            clipElement.remove();
        });
        
        trackLane.appendChild(clipElement);
    }

    removeClip(trackIndex, clipId) {
        this.tracks[trackIndex].clips = this.tracks[trackIndex].clips.filter(clip => clip.id !== clipId);
    }

    setupEffectsPanel() {
        const trackSelect = document.getElementById('effectsTrackSelect');
        const sliders = {
            volume: document.getElementById('volumeSlider'),
            pan: document.getElementById('panSlider'),
            reverb: document.getElementById('reverbSlider'),
            delay: document.getElementById('delaySlider'),
            highEq: document.getElementById('highEqSlider'),
            midEq: document.getElementById('midEqSlider'),
            lowEq: document.getElementById('lowEqSlider')
        };
        
        const values = {
            volume: document.getElementById('volumeValue'),
            pan: document.getElementById('panValue'),
            reverb: document.getElementById('reverbValue'),
            delay: document.getElementById('delayValue'),
            highEq: document.getElementById('highEqValue'),
            midEq: document.getElementById('midEqValue'),
            lowEq: document.getElementById('lowEqValue')
        };

        if (trackSelect) {
            trackSelect.addEventListener('change', (e) => {
                this.selectedTrack = parseInt(e.target.value);
                this.updateEffectsDisplay();
            });
        }

        Object.keys(sliders).forEach(key => {
            const slider = sliders[key];
            if (slider) {
                slider.addEventListener('input', (e) => {
                    const value = parseInt(e.target.value);
                    if (key === 'volume' || key === 'pan') {
                        this.tracks[this.selectedTrack][key] = value;
                    } else {
                        this.tracks[this.selectedTrack].effects[key] = value;
                    }
                    this.updateEffectValue(key, value, values[key]);
                });
            }
        });

        // Initialize display
        this.updateEffectsDisplay();
    }

    updateEffectsDisplay() {
        const track = this.tracks[this.selectedTrack];
        
        const elements = {
            volume: document.getElementById('volumeSlider'),
            pan: document.getElementById('panSlider'),
            reverb: document.getElementById('reverbSlider'),
            delay: document.getElementById('delaySlider'),
            highEq: document.getElementById('highEqSlider'),
            midEq: document.getElementById('midEqSlider'),
            lowEq: document.getElementById('lowEqSlider')
        };

        const values = {
            volume: document.getElementById('volumeValue'),
            pan: document.getElementById('panValue'),
            reverb: document.getElementById('reverbValue'),
            delay: document.getElementById('delayValue'),
            highEq: document.getElementById('highEqValue'),
            midEq: document.getElementById('midEqValue'),
            lowEq: document.getElementById('lowEqValue')
        };
        
        if (elements.volume) elements.volume.value = track.volume;
        if (elements.pan) elements.pan.value = track.pan;
        if (elements.reverb) elements.reverb.value = track.effects.reverb;
        if (elements.delay) elements.delay.value = track.effects.delay;
        if (elements.highEq) elements.highEq.value = track.effects.highEq;
        if (elements.midEq) elements.midEq.value = track.effects.midEq;
        if (elements.lowEq) elements.lowEq.value = track.effects.lowEq;
        
        this.updateEffectValue('volume', track.volume, values.volume);
        this.updateEffectValue('pan', track.pan, values.pan);
        this.updateEffectValue('reverb', track.effects.reverb, values.reverb);
        this.updateEffectValue('delay', track.effects.delay, values.delay);
        this.updateEffectValue('highEq', track.effects.highEq, values.highEq);
        this.updateEffectValue('midEq', track.effects.midEq, values.midEq);
        this.updateEffectValue('lowEq', track.effects.lowEq, values.lowEq);
    }

    updateEffectValue(type, value, element) {
        if (!element) return;
        
        if (type.includes('Eq')) {
            element.textContent = `${value > 0 ? '+' : ''}${value} dB`;
        } else {
            element.textContent = value;
        }
    }

    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        
        const playIcon = document.querySelector('.play-icon');
        const pauseIcon = document.querySelector('.pause-icon');
        const transportBtn = document.getElementById('transportPlay');
        
        if (this.isPlaying) {
            if (playIcon) playIcon.classList.add('hidden');
            if (pauseIcon) pauseIcon.classList.remove('hidden');
            if (transportBtn) transportBtn.textContent = '⏸';
            this.startPlayback();
        } else {
            if (playIcon) playIcon.classList.remove('hidden');
            if (pauseIcon) pauseIcon.classList.add('hidden');
            if (transportBtn) transportBtn.textContent = '▶';
            this.stopPlayback();
        }
    }

    stop() {
        this.isPlaying = false;
        this.currentPosition = 0;
        this.playheadPosition = 0;
        
        const playIcon = document.querySelector('.play-icon');
        const pauseIcon = document.querySelector('.pause-icon');
        const transportBtn = document.getElementById('transportPlay');
        
        if (playIcon) playIcon.classList.remove('hidden');
        if (pauseIcon) pauseIcon.classList.add('hidden');
        if (transportBtn) transportBtn.textContent = '▶';
        
        this.stopPlayback();
        this.updatePlayhead();
        this.updateDisplay();
    }

    toggleLoop() {
        this.looping = !this.looping;
        const loopBtn = document.getElementById('loopToggle');
        if (loopBtn) {
            loopBtn.classList.toggle('btn--primary', this.looping);
        }
    }

    startPlayback() {
        this.playbackInterval = setInterval(() => {
            this.currentPosition += 1 / 60; // 60 FPS update
            this.playheadPosition = this.currentPosition;
            this.updatePlayhead();
            this.updateDisplay();
            
            // Check for clips to play
            this.checkClipsForPlayback();
            
            // Loop if enabled (simple 8-beat loop)
            if (this.looping && this.currentPosition >= 8) {
                this.currentPosition = 0;
                this.playheadPosition = 0;
            }
        }, 1000 / 60);
    }

    stopPlayback() {
        if (this.playbackInterval) {
            clearInterval(this.playbackInterval);
        }
    }

    checkClipsForPlayback() {
        // Simplified clip playback checking
        this.tracks.forEach((track, trackIndex) => {
            if (track.muted) return;
            
            track.clips.forEach(clip => {
                const clipStart = clip.position;
                const clipEnd = clip.position + clip.duration;
                
                if (this.currentPosition >= clipStart && this.currentPosition <= clipEnd) {
                    // Play clip if just started
                    if (Math.abs(this.currentPosition - clipStart) < 0.1) {
                        this.synthesizeSound(clip.soundData, clip.duration);
                    }
                }
            });
        });
    }

    updatePlayhead() {
        const playhead = document.getElementById('playhead');
        if (playhead) {
            const pixelsPerBeat = 100 * this.zoom;
            playhead.style.left = `${this.playheadPosition * pixelsPerBeat}px`;
        }
    }

    updateDisplay() {
        const beats = Math.floor(this.currentPosition % 4) + 1;
        const measures = Math.floor(this.currentPosition / 4) + 1;
        const position = `${measures.toString().padStart(3, '0')}.${beats}`;
        
        const positionDisplay = document.getElementById('positionDisplay');
        const transportPosition = document.getElementById('transportPosition');
        
        if (positionDisplay) positionDisplay.textContent = position;
        if (transportPosition) transportPosition.textContent = position;
    }

    adjustZoom(factor) {
        this.zoom *= factor;
        this.zoom = Math.max(0.5, Math.min(3, this.zoom)); // Limit zoom range
        this.setupTimeline();
        this.updatePlayhead();
    }

    exportProject() {
        // Simulate export functionality
        const projectData = {
            tempo: this.tempo,
            tracks: this.tracks.map(track => ({
                clips: track.clips.map(clip => ({
                    name: clip.soundData.name,
                    position: clip.position,
                    duration: clip.duration
                })),
                volume: track.volume,
                pan: track.pan,
                effects: track.effects
            }))
        };
        
        // Create a fake download
        const dataStr = JSON.stringify(projectData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'insect-beats-project.json';
        downloadLink.click();
        URL.revokeObjectURL(url);
        
        // Show success message
        alert('Project exported successfully! 🎵');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.insectBeatsStudio = new InsectBeatsStudio();
});