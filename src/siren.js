export class Siren {
        constructor() {
                this.canvas = null;
                this.ctx = null;
                this.playPauseBtn = null;
                this.rightPanel = null;
                this.bottomPanel = null;
                this.audio = null;
                this.sources = [];
                this.analyser = null;
                this.requestID = null;
        }
        init() {
                this.canvas = this.initCanvas();
                this.ctx = this.canvas.getContext("2d");
                this.playPauseBtn = this.initPlayPauseBtn();
                this.rightPanel = this.initRightPanel();
                this.bottomPanel = this.initBottomPanel();
                this.audio = this.initAudio();
                this.initVisualizer();
        }
        initPlayPauseBtn() {
                const playPauseBtn = document.createElement("div");
                document.body.appendChild(playPauseBtn);
                playPauseBtn.classList.add("playPauseBtn");

                const span = document.createElement("span");
                playPauseBtn.appendChild(span);
                playPauseBtn.span = span;
                span.innerHTML = "▶️";
                span.addEventListener("click", () => {
                        if (this.audio.childElementCount === 0) {
                                this.playFirstTrack();
                        }
                        if (span.innerHTML === "⏸") {
                                this.audio.pause();
                        } else {
                                this.audio.play();
                        }
                });
                return playPauseBtn;
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
                playPreviousTrackBtn.innerHTML = "⏮";
                playPreviousTrackBtn.addEventListener("click", () => {
                        this.playPreviousTrack();
                });

                const playNextTrackBtn = document.createElement("span");
                controls.appendChild(playNextTrackBtn);
                playNextTrackBtn.classList.add("playPreviousTrackBtn");
                playNextTrackBtn.innerHTML = "⏭";
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
                loader.accept = ".mp3"
                loader.multiple = true;
                loader.addEventListener("change", _ => {
                        [...loader.files].map((file) => file.name.slice(0, -4)).forEach(name => {
                                this.addSrcToQueue(`../data/music/${name}.mp3`);
                        });
                });




                return rightPanel;
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
                        this.playPauseBtn.span.innerHTML = "⏸";
                        this.runVisualizer();
                });
                audio.addEventListener("pause", _ => {
                        this.playPauseBtn.span.innerHTML = "▶️";
                        this.stopVisualizer();
                });

                return audio;
        }
        addSrcToQueue(src) {
                const source = document.createElement("source");
                source.type = "audio/mpeg";
                source.src = src;
                this.sources.push(source);
        }
        playNextTrack() {
                this.audio.pause();
                const tmp = this.sources.shift();
                this.sources.push(tmp);
                this.audio.innerHTML = "";
                this.audio.appendChild(this.sources[0]);
                this.audio.load();
                this.audio.play();
        }
        playPreviousTrack() {
                this.audio.pause();
                const tmp = this.sources.pop();
                this.sources.unshift(tmp);
                this.audio.innerHTML = "";
                this.audio.appendChild(this.sources[0]);
                this.audio.load();
                this.audio.play();
        }
        playFirstTrack() {
                this.audio.pause();
                this.audio.appendChild(this.sources[0]);
                this.audio.load();
                this.audio.play();
        }
        initVisualizer() {
                const context = new AudioContext();
                this.analyser = context.createAnalyser();
                const source = context.createMediaElementSource(this.audio);
                source.connect(this.analyser);
                this.analyser.connect(context.destination);

        }
        updateVisualizer() {
                requestAnimationFrame(_ => this.updateVisualizer());
                const fbcArray = new Uint8Array(this.analyser.frequencyBinCount);
                this.analyser.getByteFrequencyData(fbcArray);
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.fillStyle = '#0DDEFF';
                const barWidth = 2;
                const gap = 1;
                const barStep = barWidth + gap;
                const NumberOfBars = (this.canvas.width / barStep >= 1024) ? this.canvas.width / barStep : 1023;
                for (let i = 0; i < NumberOfBars; i++) {
                        const barX = i * barStep;
                        const barHeight = -(fbcArray[i])*1.5;
                        this.ctx.fillRect(barX, this.canvas.height, barWidth, barHeight);
                }
        }
        runVisualizer() {
                this.requestID = requestAnimationFrame(_ => this.updateVisualizer());
        }
        stopVisualizer() {
                cancelAnimationFrame(this.requestID);
        }
        log() {
                console.log(this.playPauseBtn, this.rightPanel, this.bottomPanel, this.playPauseBtn, this.canvas, this.ctx, this.audio, this.sources);
        }

}