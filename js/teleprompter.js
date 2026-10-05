(function () {
    'use strict';

    const script = document.getElementById('tpScript');
    if (!script) return;

    const GUIDE = 72;
    const STORE = 'binodsuman.teleprompter.v1';
    const SAMPLE = [
        'Hello, I am Binod Suman.',
        'Today I will walk through one idea, slowly and clearly.',
        '',
        'Start with the problem your viewer has.',
        'Then show the simplest version of the solution.',
        'Pause after each step so the point can land.',
        '',
        'Look at the camera, not at the edges of the screen.',
        'The yellow line is where your eyes should sit.',
        '',
        'When you finish, stop the recording and download the video.',
        'It stays in this browser. Nothing is uploaded.'
    ].join('\n');

    const speedEl = document.getElementById('tpSpeed');
    const fontEl = document.getElementById('tpFont');
    const familyEl = document.getElementById('tpFamily');
    const speedVal = document.getElementById('tpSpeedVal');
    const fontVal = document.getElementById('tpFontVal');
    const wordsEl = document.getElementById('tpWords');
    const timeEl = document.getElementById('tpTime');
    const noteEl = document.getElementById('tpTimeNote');
    const playBtn = document.getElementById('tpPlay');
    const statusEl = document.getElementById('tpStatus');
    const video = document.getElementById('tpVideo');
    const camBox = document.getElementById('tpCamBox');
    const camBtn = document.getElementById('tpCamBtn');
    const countEl = document.getElementById('tpCount');
    const recBadge = document.getElementById('tpRecBadge');
    const recClock = document.getElementById('tpRecClock');
    const recStart = document.getElementById('tpRecStart');
    const recPause = document.getElementById('tpRecPause');
    const recStop = document.getElementById('tpRecStop');
    const downloadBtn = document.getElementById('tpDownload');
    const goBtn = document.getElementById('tpGo');
    const mirrorBtn = document.getElementById('tpMirror');
    const expandBtn = document.getElementById('tpExpand');
    const layout = document.getElementById('tpLayout');
    const guide = layout.querySelector('.tp-guide');

    let camStream = null;
    let recorder = null;
    let recState = 'idle';
    let chunks = [];
    let lastBlob = null;
    let lastUrl = '';
    let lastName = '';
    let wantDownload = false;
    let playing = false;
    let raf = 0;
    let carry = 0;
    let lastTs = 0;
    let padFor = 0;
    let countToken = 0;
    let recAccum = 0;
    let recMark = 0;
    let recTimer = 0;
    let scrollWasPlaying = false;
    let goLock = false;
    let saveTimer = 0;
    let releaseCameraAfterStop = false;
    const recWord = document.getElementById('tpRecWord');

    function setStatus(msg, isErr) {
        statusEl.textContent = msg || '';
        statusEl.classList.toggle('is-err', !!isErr);
    }

    function formatClock(totalSeconds, useFloor) {
        const s = Math.max(0, useFloor ? Math.floor(totalSeconds) : Math.round(totalSeconds));
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const r = s % 60;
        if (h) return h + ':' + String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
        return m + ':' + String(r).padStart(2, '0');
    }

    function countWords(text) {
        const found = text.trim().match(/\S+/g);
        return found ? found.length : 0;
    }

    function cameraMessage(err) {
        if (!err) return 'Could not open the camera.';
        if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
            return 'Camera permission was blocked. Allow the camera for this site, then try again.';
        }
        if (err.name === 'NotFoundError' || err.name === 'OverconstrainedError') {
            return 'No camera was found on this device.';
        }
        return err.message || 'Could not open the camera.';
    }

    function syncPadding() {
        const h = script.clientHeight;
        if (!h || h === padFor) return;
        padFor = h;
        script.style.paddingTop = GUIDE + 'px';
        script.style.paddingBottom = Math.max(24, h - GUIDE) + 'px';
        if (guide) guide.style.top = GUIDE + 'px';
    }

    function applyType() {
        const size = Number(fontEl.value) || 36;
        const speed = Number(speedEl.value) || 35;
        script.style.fontSize = size + 'px';
        script.style.fontFamily = familyEl.value;
        speedVal.textContent = speed + ' px/s';
        fontVal.textContent = size + ' px';
        speedEl.setAttribute('aria-valuenow', String(speed));
        fontEl.setAttribute('aria-valuenow', String(size));
    }

    function refreshStats() {
        if (!script.clientHeight) {
            wordsEl.textContent = String(countWords(script.value));
            return;
        }
        syncPadding();
        applyType();
        const words = countWords(script.value);
        const distance = words ? Math.max(0, script.scrollHeight - script.clientHeight) : 0;
        const px = Number(speedEl.value) || 35;
        const size = Number(fontEl.value) || 36;
        const seconds = words && px ? distance / px : 0;
        wordsEl.textContent = String(words);
        timeEl.textContent = formatClock(seconds, false);
        if (!words) {
            noteEl.textContent = 'Time uses scroll speed and font size.';
        } else if (distance < 8) {
            noteEl.textContent = 'Fits on screen. A larger font will make it scroll.';
        } else {
            const wpm = Math.max(1, Math.round(words / (seconds / 60)));
            noteEl.textContent = size + ' px · about ' + wpm + ' words/min. Larger type takes longer.';
        }
    }

    function scheduleSave() {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(saveSettings, 350);
    }

    function saveSettings() {
        try {
            localStorage.setItem(STORE, JSON.stringify({
                script: script.value,
                speed: Number(speedEl.value),
                font: Number(fontEl.value),
                family: familyEl.value,
                mirror: script.classList.contains('is-mirror'),
                orient: layout.classList.contains('is-stacked') ? 'stacked' : 'side'
            }));
        } catch (e) { /* private mode */ }
    }

    function loadSettings() {
        try {
            const raw = localStorage.getItem(STORE);
            if (!raw) return;
            const data = JSON.parse(raw);
            if (typeof data.script === 'string') script.value = data.script;
            if (data.speed) speedEl.value = String(data.speed);
            if (data.font) fontEl.value = String(data.font);
            if (data.family && [...familyEl.options].some((o) => o.value === data.family)) familyEl.value = data.family;
            const mirrored = !!data.mirror;
            script.classList.toggle('is-mirror', mirrored);
            mirrorBtn.setAttribute('aria-pressed', mirrored ? 'true' : 'false');
            mirrorBtn.classList.toggle('is-on', mirrored);
            applyOrientation(data.orient === 'stacked');
        } catch (e) { /* ignore broken storage */ }
    }

    function pauseScroll() {
        playing = false;
        script.readOnly = false;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        playBtn.textContent = 'Play';
        playBtn.setAttribute('aria-pressed', 'false');
    }

    function playScroll() {
        syncPadding();
        const max = Math.max(0, script.scrollHeight - script.clientHeight);
        if (max < 8) {
            setStatus('The script fits on screen at this font, so there is nothing to scroll.');
            return;
        }
        if (script.scrollTop >= max - 2) script.scrollTop = 0;
        playing = true;
        script.readOnly = true;
        lastTs = 0;
        carry = 0;
        playBtn.textContent = 'Pause';
        playBtn.setAttribute('aria-pressed', 'true');
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(tick);
    }

    function tick(now) {
        if (!playing) return;
        if (!lastTs) lastTs = now;
        const dt = Math.min(0.05, (now - lastTs) / 1000);
        lastTs = now;
        const px = Number(speedEl.value) || 35;
        carry += px * dt;
        const step = Math.floor(carry);
        const max = Math.max(0, script.scrollHeight - script.clientHeight);
        if (step > 0) {
            script.scrollTop = Math.min(max, script.scrollTop + step);
            carry -= step;
        }
        if (script.scrollTop >= max - 1) {
            script.scrollTop = max;
            pauseScroll();
            setStatus('End of script.');
            return;
        }
        raf = requestAnimationFrame(tick);
    }

    function toTop() {
        pauseScroll();
        script.scrollTop = 0;
    }

    function cancelCountdown() {
        countToken += 1;
        countEl.hidden = true;
    }

    function countdown(seconds) {
        cancelCountdown();
        const token = countToken;
        countEl.hidden = false;
        countEl.textContent = String(seconds);
        return new Promise((resolve) => {
            let left = seconds;
            const timer = setInterval(() => {
                if (token !== countToken) {
                    clearInterval(timer);
                    resolve(false);
                    return;
                }
                left -= 1;
                if (left <= 0) {
                    clearInterval(timer);
                    countEl.hidden = true;
                    resolve(true);
                } else {
                    countEl.textContent = String(left);
                }
            }, 1000);
        });
    }

    function pickMime(hasAudio) {
        if (typeof MediaRecorder === 'undefined') return '';
        const types = hasAudio
            ? ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4']
            : ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm', 'video/mp4'];
        return types.find((t) => {
            try { return MediaRecorder.isTypeSupported(t); } catch (e) { return false; }
        }) || '';
    }

    function extFor(mime) {
        return /mp4/i.test(mime) ? 'mp4' : 'webm';
    }

    function stampName(ext) {
        const d = new Date();
        const p = (n) => String(n).padStart(2, '0');
        return 'teleprompter-' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds()) + '.' + ext;
    }

    async function ensureCamera() {
        if (camStream && camStream.getVideoTracks().some((t) => t.readyState === 'live')) return camStream;
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('This browser cannot open the camera.');
        }
        const videoConstraints = { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } };
        let stream;
        let audioOk = true;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: { echoCancellation: true, noiseSuppression: true } });
        } catch (err) {
            if (err && (err.name === 'NotAllowedError' || err.name === 'SecurityError')) throw err;
            audioOk = false;
            stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: false });
        }
        camStream = stream;
        video.srcObject = stream;
        camBox.classList.add('is-live');
        camBtn.textContent = 'Turn camera off';
        if (!audioOk || !stream.getAudioTracks().length) {
            setStatus('Camera is on. Microphone was not available, so a recording will be silent.');
        } else {
            setStatus('Camera and microphone are on. Nothing is uploaded.');
        }
        return stream;
    }

    function stopCamera() {
        if (camStream) {
            camStream.getTracks().forEach((t) => t.stop());
            camStream = null;
        }
        video.srcObject = null;
        camBox.classList.remove('is-live');
        camBtn.textContent = 'Turn camera on';
    }

    function elapsedSeconds() {
        const extra = recState === 'recording' ? Date.now() - recMark : 0;
        return (recAccum + extra) / 1000;
    }

    function paintRecClock() {
        recClock.textContent = formatClock(elapsedSeconds(), true);
    }

    function startRecClock() {
        clearInterval(recTimer);
        paintRecClock();
        recTimer = setInterval(paintRecClock, 200);
    }

    function stopRecClock() {
        clearInterval(recTimer);
        recTimer = 0;
    }

    function updateRecUi() {
        const active = recState !== 'idle';
        recStart.disabled = active;
        recPause.disabled = !active;
        recStop.disabled = !active;
        goBtn.disabled = active;
        recPause.textContent = recState === 'paused' ? 'Resume' : 'Pause';
        recBadge.hidden = !active;
        recBadge.classList.toggle('is-paused', recState === 'paused');
        if (recWord) recWord.textContent = recState === 'paused' ? 'PAUSE' : 'REC';
        if (active) paintRecClock();
    }

    function rememberVideo(blob) {
        if (lastUrl) URL.revokeObjectURL(lastUrl);
        lastBlob = blob;
        lastUrl = URL.createObjectURL(blob);
        lastName = stampName(extFor(blob.type || ''));
        downloadBtn.hidden = false;
    }

    function onRecStop() {
        stopRecClock();
        recState = 'idle';
        updateRecUi();
        const type = (recorder && recorder.mimeType) || 'video/webm';
        const blob = new Blob(chunks, { type: type });
        recorder = null;
        chunks = [];
        const releaseCam = releaseCameraAfterStop;
        releaseCameraAfterStop = false;
        if (!blob.size) {
            if (releaseCam) stopCamera();
            setStatus('Recording was empty.', true);
            return;
        }
        rememberVideo(blob);
        if (releaseCam) stopCamera();
        setStatus('Recording saved in this browser. Download it to keep the file.');
        if (wantDownload) downloadVideo();
        wantDownload = false;
    }

    function startRecording() {
        if (recState !== 'idle' || !camStream) return false;
        if (typeof MediaRecorder === 'undefined') {
            setStatus('This browser cannot record video.', true);
            return false;
        }
        const hasAudio = camStream.getAudioTracks().some((t) => t.readyState === 'live');
        const mime = pickMime(hasAudio);
        chunks = [];
        try {
            recorder = mime ? new MediaRecorder(camStream, { mimeType: mime }) : new MediaRecorder(camStream);
        } catch (err) {
            setStatus(err.message || 'Could not start recording.', true);
            recorder = null;
            return false;
        }
        recorder.ondataavailable = (ev) => {
            if (ev.data && ev.data.size) chunks.push(ev.data);
        };
        recorder.onstop = onRecStop;
        recorder.onerror = () => setStatus('Recording failed.', true);
        try {
            recorder.start(250);
        } catch (err) {
            setStatus(err.message || 'Could not start recording.', true);
            recorder = null;
            return false;
        }
        recState = 'recording';
        recAccum = 0;
        recMark = Date.now();
        startRecClock();
        updateRecUi();
        setStatus(hasAudio ? 'Recording camera and microphone.' : 'Recording camera only.');
        return true;
    }

    function toggleRecPause() {
        if (!recorder || recState === 'idle') return;
        if (typeof recorder.pause !== 'function' || typeof recorder.resume !== 'function') {
            setStatus('Pause is not available in this browser. Use Stop, then Start again.', true);
            return;
        }
        if (recState === 'recording') {
            scrollWasPlaying = playing;
            try { recorder.pause(); } catch (err) {
                setStatus(err.message || 'Could not pause.', true);
                return;
            }
            recAccum += Date.now() - recMark;
            recState = 'paused';
            pauseScroll();
            updateRecUi();
            setStatus('Recording paused. Scroll is paused too.');
            return;
        }
        try { recorder.resume(); } catch (err) {
            setStatus(err.message || 'Could not resume.', true);
            return;
        }
        recMark = Date.now();
        recState = 'recording';
        updateRecUi();
        if (scrollWasPlaying) playScroll();
        setStatus('Recording.');
    }

    function stopRecording(autoDownload, releaseCamera) {
        if (!recorder || recState === 'idle') {
            if (releaseCamera) stopCamera();
            return;
        }
        wantDownload = !!autoDownload;
        releaseCameraAfterStop = !!releaseCamera;
        recState = 'idle';
        pauseScroll();
        updateRecUi();
        try {
            recorder.stop();
        } catch (err) {
            releaseCameraAfterStop = false;
            if (releaseCamera) stopCamera();
            setStatus(err.message || 'Could not stop recording.', true);
        }
    }

    async function recordAndScroll() {
        if (goLock || recState !== 'idle') return;
        goLock = true;
        try {
            await ensureCamera();
            toTop();
            setStatus('Starting in 3… look at the camera.');
            const ok = await countdown(3);
            if (!ok) {
                setStatus('Cancelled.');
                return;
            }
            if (startRecording()) playScroll();
        } catch (err) {
            setStatus(cameraMessage(err), true);
        } finally {
            goLock = false;
        }
    }

    function downloadVideo() {
        if (!lastUrl) return;
        const a = document.createElement('a');
        a.href = lastUrl;
        a.download = lastName || 'teleprompter.webm';
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    async function onCamButton() {
        if (camStream) {
            if (recState !== 'idle') stopRecording(true, true);
            else {
                stopCamera();
                setStatus('Camera off.');
            }
            return;
        }
        try {
            await ensureCamera();
        } catch (err) {
            setStatus(cameraMessage(err), true);
        }
    }

    async function onRecStart() {
        try {
            await ensureCamera();
            startRecording();
        } catch (err) {
            setStatus(cameraMessage(err), true);
        }
    }

    function toggleMirror() {
        const on = !script.classList.contains('is-mirror');
        script.classList.toggle('is-mirror', on);
        mirrorBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
        mirrorBtn.classList.toggle('is-on', on);
        scheduleSave();
    }

    const orientBtn = document.getElementById('tpOrient');

    function applyOrientation(stacked) {
        layout.classList.toggle('is-stacked', stacked);
        orientBtn.setAttribute('aria-pressed', stacked ? 'true' : 'false');
        orientBtn.classList.toggle('is-on', stacked);
        orientBtn.textContent = stacked ? 'Left / right' : 'Top / bottom';
        padFor = 0;
        requestAnimationFrame(refreshStats);
    }

    function toggleOrientation() {
        applyOrientation(!layout.classList.contains('is-stacked'));
        scheduleSave();
    }

    function toggleExpand() {
        const el = layout;
        if (document.fullscreenElement === el) {
            document.exitFullscreen();
            return;
        }
        const req = el.requestFullscreen || el.webkitRequestFullscreen;
        if (req) req.call(el);
    }

    function loadSample() {
        if (script.value.trim() && script.value !== SAMPLE && !window.confirm('Replace the current script with the sample?')) return;
        pauseScroll();
        script.value = SAMPLE;
        script.scrollTop = 0;
        refreshStats();
        scheduleSave();
    }

    function clearScript() {
        if (!script.value.trim()) return;
        if (!window.confirm('Clear the script?')) return;
        pauseScroll();
        script.value = '';
        script.scrollTop = 0;
        refreshStats();
        scheduleSave();
    }

    function shutdown() {
        cancelCountdown();
        pauseScroll();
        if (recorder && recState !== 'idle') stopRecording(true, true);
        else stopCamera();
    }

    script.addEventListener('input', () => {
        refreshStats();
        scheduleSave();
    });
    speedEl.addEventListener('input', () => { refreshStats(); scheduleSave(); });
    fontEl.addEventListener('input', () => { refreshStats(); scheduleSave(); });
    familyEl.addEventListener('change', () => { refreshStats(); scheduleSave(); });
    playBtn.addEventListener('click', () => { if (playing) pauseScroll(); else playScroll(); });
    document.getElementById('tpTop').addEventListener('click', toTop);
    mirrorBtn.addEventListener('click', toggleMirror);
    document.getElementById('tpSample').addEventListener('click', loadSample);
    document.getElementById('tpClear').addEventListener('click', clearScript);
    orientBtn.addEventListener('click', toggleOrientation);
    expandBtn.addEventListener('click', toggleExpand);
    camBtn.addEventListener('click', onCamButton);
    goBtn.addEventListener('click', recordAndScroll);
    recStart.addEventListener('click', onRecStart);
    recPause.addEventListener('click', toggleRecPause);
    recStop.addEventListener('click', () => stopRecording(true));
    downloadBtn.addEventListener('click', downloadVideo);

    document.addEventListener('fullscreenchange', () => {
        const on = document.fullscreenElement === layout;
        expandBtn.textContent = on ? 'Exit' : 'Expand';
        padFor = 0;
        requestAnimationFrame(refreshStats);
    });

    document.addEventListener('tools:open', (ev) => {
        const id = ev.detail && ev.detail.id;
        if (id === 'teleprompter') {
            padFor = 0;
            requestAnimationFrame(refreshStats);
            return;
        }
        shutdown();
    });

    window.addEventListener('beforeunload', () => {
        if (camStream) camStream.getTracks().forEach((t) => t.stop());
    });

    if (window.ResizeObserver) {
        const stage = layout.querySelector('.tp-stage');
        const observer = new ResizeObserver(() => {
            if (script.clientHeight && script.clientHeight !== padFor) refreshStats();
        });
        observer.observe(stage);
    }

    loadSettings();
    applyType();
    updateRecUi();
    requestAnimationFrame(refreshStats);
})();
