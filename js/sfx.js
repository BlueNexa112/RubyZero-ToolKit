/* ToolKit — SFX Library
   Semua suara disintesis via Web Audio API, tanpa file eksternal.
   Context di-unlock otomatis pada gesture pertama pengguna. */
(function (w) {
  var ctx, unlocked = false;
  function ac() {
    if (!ctx) { try { ctx = new (w.AudioContext || w.webkitAudioContext)(); } catch (e) {} }
    if (ctx && ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }
  function unlock() { if (!unlocked) { ac(); unlocked = true; } }
  ['touchstart','touchend','click','keydown','pointerdown'].forEach(function (ev) {
    document.addEventListener(ev, unlock, { once: true, passive: true });
  });

  function tone(f1, dur, type, vol, f2) {
    var c = ac(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f1, c.currentTime);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, c.currentTime + dur);
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    o.connect(g); g.connect(c.destination);
    o.start(); o.stop(c.currentTime + dur);
  }
  function noise(dur, vol, filt) {
    var c = ac(); if (!c) return;
    var sr = c.sampleRate;
    var buf = c.createBuffer(1, sr * dur, sr);
    var d = buf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    var src = c.createBufferSource(); src.buffer = buf;
    var g = c.createGain();
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    var node = src;
    if (filt) {
      var bp = c.createBiquadFilter();
      bp.type = 'lowpass'; bp.frequency.value = filt;
      node.connect(bp); bp.connect(g);
    } else { node.connect(g); }
    g.connect(c.destination);
    src.start(); src.stop(c.currentTime + dur);
  }

  w.SFX = {
    tap:    function () { tone(720, 0.045, 'sine', 0.07); },
    click:  function () { tone(900, 0.04, 'square', 0.05); },
    ok:     function () { tone(880, 0.1, 'sine', 0.13); setTimeout(function(){ tone(1320, 0.14, 'sine', 0.13); }, 85); },
    err:    function () { tone(220, 0.18, 'sawtooth', 0.11); },
    win:    function () { [523,659,784,1047].forEach(function(f,i){ setTimeout(function(){ tone(f, 0.2, 'triangle', 0.13); }, i*95); }); },
    lose:   function () { [392,330,262].forEach(function(f,i){ setTimeout(function(){ tone(f, 0.22, 'sawtooth', 0.11); }, i*115); }); },
    coin:   function () { tone(988, 0.07, 'square', 0.11); setTimeout(function(){ tone(1318, 0.14, 'square', 0.11); }, 55); },
    jump:   function () { tone(280, 0.14, 'sine', 0.11, 820); },
    hit:    function () { noise(0.13, 0.13, 900); tone(140, 0.13, 'sawtooth', 0.09); },
    tick:   function () { tone(1250, 0.03, 'square', 0.045); },
    shoot:  function () { tone(1600, 0.055, 'square', 0.07, 500); },
    explode:function () { noise(0.35, 0.18, 700); tone(70, 0.32, 'sawtooth', 0.13); },
    pop:    function () { tone(550, 0.06, 'sine', 0.09, 1200); },
    flip:   function () { tone(480, 0.05, 'triangle', 0.07, 760); },
    pickup: function () { tone(660, 0.07, 'square', 0.09); setTimeout(function(){ tone(990, 0.08, 'square', 0.09); }, 55); },
    scroll: function () { tone(400, 0.03, 'sine', 0.03, 520); }
  };
})(window);