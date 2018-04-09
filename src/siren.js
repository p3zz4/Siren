export class Siren {
        constructor() {
                this.canvas = this.initCanvas();
                this.ctx = this.canvas.getContext("2d");
                this.playPauseBtn = this.initPlayPauseBtn();
                this.rightPanel = this.initRightPanel();
                this.playlist = this.initPlaylist(this.rightPanel);
                this.bottomPanel = this.initBottomPanel();
                this.audio = this.initAudio();
                this.sourceElements = [];
                this.analyser = this.initAnalyser();
                this.requestID = null;
                this.updateLocalPlaylist();
                this.initKeyboardShortcuts();
        }

        initPlayPauseBtn() {
                const playPauseBtn = document.createElement("div");
                document.body.appendChild(playPauseBtn);
                playPauseBtn.classList.add("playPauseBtn");

                const span = document.createElement("span");
                playPauseBtn.appendChild(span);
                span.innerHTML = `<i class="fas fa-play"></i>`;
                span.addEventListener("click", () => {
                        if (this.audio.childElementCount === 0) {
                                this.playFirstTrack();
                        } else {
                                if (this.audio.paused) {
                                        this.audio.play();
                                } else {
                                        this.audio.pause();
                                }
                        }
                });
                return span;
        }
        togglePlayPauseBtn() {
                if (this.audio.paused) {
                        this.playPauseBtn.innerHTML = `<i class="fas fa-play"></i>`;
                } else {
                        this.playPauseBtn.innerHTML = `<i class="fas fa-pause"></i>`;
                }
        }
        initBottomPanel() {
                const bottomPanel = document.createElement("div");
                document.body.appendChild(bottomPanel);
                bottomPanel.classList.add("bottomPanel");

                const controls = document.createElement("div");
                bottomPanel.appendChild(controls);
                controls.classList.add("controls");

                const playPreviousTrackBtn = document.createElement("span");
                controls.appendChild(playPreviousTrackBtn);
                playPreviousTrackBtn.classList.add("playNextTrackBtn");
                playPreviousTrackBtn.innerHTML = `<i class="fas fa-fast-backward"></i>`;
                playPreviousTrackBtn.addEventListener("click", () => {
                        this.playPreviousTrack();
                });

                const playNextTrackBtn = document.createElement("span");
                controls.appendChild(playNextTrackBtn);
                playNextTrackBtn.classList.add("playPreviousTrackBtn");
                playNextTrackBtn.innerHTML = `<i class="fas fa-fast-forward"></i>`;
                playNextTrackBtn.addEventListener("click", () => {
                        this.playNextTrack();
                });

                return bottomPanel;
        }
        initRightPanel() {
                const rightPanel = document.createElement("div");
                document.body.appendChild(rightPanel);
                rightPanel.classList.add("rightPanel");

                const loader = document.createElement("input");
                rightPanel.appendChild(loader);
                loader.type = "file";
                loader.id = "file";
                loader.accept = ".mp3"
                loader.multiple = true;

                const label = document.createElement("label");
                rightPanel.appendChild(label);
                label.classList.add("label");
                label.htmlFor = "file";
                label.innerHTML = "+";

                loader.addEventListener("change", (event) => {
                        [...loader.files].map((file) => file.name.slice(0, -4)).reduce((promises, name) =>
                                promises.then(_ => this.addToRemotePlaylist(name, `../data/music/${name}.mp3`)), Promise.resolve([])
                        ).then(_ => {
                                this.updateLocalPlaylist();
                        });
                });

                return rightPanel;
        }
        initPlaylist(parent) {
                const playlist = document.createElement("div");
                parent.appendChild(playlist);
                playlist.classList.add("playlist");
                return playlist;
        }
        initCanvas() {
                const canvas = document.createElement("canvas");
                document.body.appendChild(canvas);
                canvas.classList.add("canvas");
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                window.addEventListener("resize", () => {
                        canvas.width = window.innerWidth;
                        canvas.height = window.innerHeight;
                })
                return canvas;
        }
        initAudio() {
                const audio = document.createElement("audio");
                this.bottomPanel.appendChild(audio);
                audio.classList.add("audio");
                audio.controls = "contols";
                audio.preload = "auto";
                audio.addEventListener("play", _ => {
                        this.runVisualizer();
                        this.togglePlayPauseBtn();
                });
                audio.addEventListener("pause", _ => {
                        this.stopVisualizer();
                        this.togglePlayPauseBtn();
                });
                audio.addEventListener("ended", _ => {
                        this.playNextTrack();
                });
                return audio;
        }
        addSourceToQueue(newSource, index) {
                const source = document.createElement("source");
                source.type = "audio/mpeg";
                source.src = newSource;
                this.sourceElements[index] = source;
        }
        playTrackAtIndex(index) {
                this.audio.pause();
                this.audio.innerHTML = "";
                this.audio.appendChild(this.sourceElements[index]);
                this.audio.load();
                this.audio.play();
        }
        playFirstTrack() {
                if (this.sourceElements.length === 0) {
                        return;
                }
                this.playTrackAtIndex(0);
        }
        playNextTrack() {
                if (this.sourceElements.length === 0) {
                        return;
                }
                this.playTrackAtIndex((this.sourceElements.indexOf(this.audio.firstChild) + 1) % this.sourceElements.length);
        }
        playPreviousTrack() {
                if (this.sourceElements.length === 0) {
                        return;
                }
                if (this.sourceElements.length === 0) {
                        return;
                }
                this.playTrackAtIndex((this.sourceElements.indexOf(this.audio.firstChild) + this.sourceElements.length - 1) % this.sourceElements.length);

        }
        forwardFiveSec(audio) {
                audio.currentTime += 5;
        }
        backwardFiveSec(audio) {
                audio.currentTime -= 5;
        }
        initAnalyser() {
                const context = new AudioContext();
                const analyser = context.createAnalyser();
                const source = context.createMediaElementSource(this.audio);
                source.connect(analyser);
                analyser.connect(context.destination);
                return analyser;
        }
        updateVisualizer() {
                this.requestID = requestAnimationFrame(_ => this.updateVisualizer());
                const fbcArray = new Uint8Array(this.analyser.frequencyBinCount);
                this.analyser.getByteFrequencyData(fbcArray);
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.fillStyle = '#0DDEFF';
                // const barWidth = window.innerWidth * 0.002; 
                // const gap = window.innerWidth * 0.001;
                const barWidth = 2;
                const gap = 1;
                const barStep = barWidth + gap;
                const NumberOfBars = (this.canvas.width / barStep >= 1024) ? this.canvas.width / barStep : 1023;
                for (let i = 0; i < NumberOfBars; i++) {
                        const barX = i * barStep;
                        const barHeight = -(fbcArray[i]) * 0.004 * window.innerHeight * 0.8; // 0.004 ~ 1/255; array takes value from 0 to 255
                        this.ctx.fillRect(barX, this.canvas.height, barWidth, barHeight);
                }
        }
        runVisualizer() {
                this.requestID = requestAnimationFrame(_ => this.updateVisualizer());
        }
        stopVisualizer() {
                setTimeout(_ => {
                        cancelAnimationFrame(this.requestID);
                }, 2000);

        }
        addToRemotePlaylist(name, path) {
                return fetch("http://localhost:3000/playlist", {
                        headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                        },
                        method: "POST",
                        body: JSON.stringify({
                                //id: `${path}`,
                                name: `${name}`,
                                path: `${path}`

                        })
                });
        }
        updateLocalPlaylist() {
                this.sourceElements = [];
                this.playlist.innerHTML = "";
                return fetch("http://localhost:3000/playlist")
                        .then(response => response.json().then((response) => response.reverse().forEach((element, index) => {

                                const track = document.createElement("div");
                                this.playlist.appendChild(track);
                                track.classList.add("track");

                                const deleteBtn = document.createElement("div");
                                track.appendChild(deleteBtn);
                                deleteBtn.classList.add("deleteBtn");
                                deleteBtn.innerHTML = `<i class="fas fa-times"></i>`;
                                deleteBtn.addEventListener("click", (event) => {
                                        fetch(`http://localhost:3000/playlist/${element.id}`, {
                                                headers: {
                                                        'Accept': 'application/json',
                                                        'Content-Type': 'application/json'
                                                },
                                                method: "DELETE"
                                        }).catch((err) => {
                                                console.log(err)
                                        });
                                        event.stopPropagation();
                                        deleteBtn.parentNode.parentNode.removeChild(deleteBtn.parentNode);
                                        this.sourceElements.splice(index, 1);
                                });
                                const name = document.createElement("div");
                                track.appendChild(name);
                                name.innerHTML = `Name: ${element.name}`;

                                track.addEventListener("click", _ => {
                                        this.playTrackAtIndex(index);
                                });



                                this.addSourceToQueue(`${element.path}`, index);

                        })));
        }
        initKeyboardShortcuts() {
                window.addEventListener("keydown", event => {
                        // space
                        if (event.which == 32) {
                                this.playPauseBtn.click();
                        }
                        // left arrow
                        if (event.which == 37) {
                                this.backwardFiveSec(this.audio);
                        }
                        // right arrow
                        if (event.which == 39) {
                                this.forwardFiveSec(this.audio);
                        }
                });
        }
}