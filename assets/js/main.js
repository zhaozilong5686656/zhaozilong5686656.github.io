
(function() {
  const data = window.PROJECT_DATA;
  const stage = document.getElementById('stage');
  
  // 初始化舞台
  stage.style.width = data.pageConfig.width + 'px';
  if (data.pageConfig.bgImage) {
    stage.style.backgroundImage = 'url(' + data.pageConfig.bgImage + ')';
  }
  stage.style.backgroundSize = 'cover';
  
  // 背景音乐处理
  if (data.pageConfig.bgm) {
    const audio = document.createElement('audio');
    audio.src = data.pageConfig.bgm;
    audio.loop = true;
    audio.volume = data.pageConfig.bgmVolume || 0.5;
    audio.autoplay = true;
    audio.muted = false;
    document.body.appendChild(audio);
    
    // 创建音乐控制按钮 - 与预览模式保持一致
    const musicBtn = document.createElement('div');
    musicBtn.className = 'music-btn';
    musicBtn.innerHTML = '<i class="fa-solid fa-music"></i>';
    document.body.appendChild(musicBtn);
    
    // 音乐播放状态管理 - 默认设置为播放状态
    let isPlaying = true;
    
    // 更新音乐按钮状态
    const updateMusicBtn = () => {
      if (isPlaying) {
        musicBtn.classList.add('playing');
        musicBtn.innerHTML = '<i class="fa-solid fa-music"></i>';
      } else {
        musicBtn.classList.remove('playing');
        musicBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      }
    };
    
    // 切换音乐播放状态
    const toggleMusic = () => {
      if (isPlaying) {
        audio.pause();
        isPlaying = false;
        updateMusicBtn();
      } else {
        isPlaying = true;
        updateMusicBtn();
        audio.play().then(() => {
          console.log('音乐播放成功');
        }).catch(err => {
          console.log('播放失败:', err);
          isPlaying = false;
          updateMusicBtn();
        });
      }
    };
    
    musicBtn.addEventListener('click', toggleMusic);
    updateMusicBtn();
    
    const tryPlayMusic = () => {
      audio.play().then(() => {
        isPlaying = true;
        updateMusicBtn();
      }).catch(err => {
        const playOnInteraction = () => {
          audio.play().then(() => {
            isPlaying = true;
            updateMusicBtn();
            document.removeEventListener('click', playOnInteraction);
            document.removeEventListener('touchstart', playOnInteraction);
            document.removeEventListener('keydown', playOnInteraction);
          });
        };
        document.addEventListener('click', playOnInteraction);
        document.addEventListener('touchstart', playOnInteraction);
        document.addEventListener('keydown', playOnInteraction);
      });
    };
    
    tryPlayMusic();
    setTimeout(tryPlayMusic, 100);
    if (document.readyState === 'complete') {
      tryPlayMusic();
    } else {
      window.addEventListener('load', tryPlayMusic);
    }
  }
  
  // 渲染元素
  data.components.forEach(item => {
    const el = document.createElement('div');
    el.className = 'gpu-el';
    el.style.width = item.style.width + 'px';
    el.style.height = item.style.height + 'px';
    el.style.zIndex = item.style.zIndex;
    el.style.fontSize = (item.style.fontSize || 16) + 'px';
    el.style.color = item.style.color;
    el.style.opacity = item.style.opacity !== undefined ? item.style.opacity : 1;
    el.style.display = item.visible === false ? 'none' : 'block';
    el.dataset.id = item.id;
    
    if (item.type === 'text') {
      el.innerText = item.props.content;
    } else if (item.type === 'image') {
      const img = document.createElement('img');
      img.src = item.props.src;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      el.appendChild(img);
    } else if (item.type === 'sprite') {
      const mask = document.createElement('div');
      mask.className = 'sprite-mask';
      const img = document.createElement('img');
      img.src = item.props.src;
      img.className = 'sprite-film';
      img.style.width = (item.props.frames * 100) + '%';
      img.style.animation = 'sprite-play ' + item.props.duration + 's steps(' + item.props.frames + ') infinite';
      mask.appendChild(img);
      el.appendChild(mask);
    } else if (item.type === 'quiz') {
      const img = document.createElement('img');
      img.src = item.props.src || 'https://via.placeholder.com/150';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';
      // 添加上下摆动动画
      img.style.animation = 'bounce 1s infinite';
      img.onclick = () => {
        if (Math.abs(scrollX - drag.startScroll) > 5) return;
        startQuiz(item);
      };
      img.style.minWidth = '44px';
      img.style.minHeight = '44px';
      el.appendChild(img);
    }
    
    stage.appendChild(el);
  });
  
  // 自适应缩放逻辑
  function resize() {
    const h = window.innerHeight;
    const w = window.innerWidth;
    let scale;
    let isPortrait = h > w;
    
    window.isPortrait = isPortrait;
    window.screenWidth = w;
    window.screenHeight = h;
    
    // 更新所有打开的模态框和提示
    document.querySelectorAll('.quiz-modal').forEach(modal => {
      if (isPortrait) {
        modal.style.width = h + 'px';
        modal.style.height = w + 'px';
      } else {
        modal.style.width = '100%';
        modal.style.height = '100%';
      }
    });

    document.querySelectorAll('.completion-rotator').forEach(el => {
      el.style.transform = isPortrait ? 'rotate(90deg)' : 'none';
    });

    document.querySelectorAll('.loading-rotator').forEach(el => {
      el.style.transform = isPortrait ? 'rotate(90deg)' : 'none';
    });
    
    if (isPortrait) {
      const canvasWidth = 932;
      const canvasHeight = 430;
      scale = h / canvasWidth;
      const rotatedContentHeight = canvasHeight * scale;
      if (rotatedContentHeight > w) {
        scale = w / canvasHeight;
      }
      
      stage.style.transform = 'scale(' + scale + ') rotate(90deg)';
      stage.style.transformOrigin = 'center center';
      stage.style.position = 'absolute';
      stage.style.left = '50%';
      stage.style.top = '50%';
      stage.style.width = canvasWidth + 'px';
      stage.style.height = canvasHeight + 'px';
      stage.style.marginLeft = '-' + (canvasWidth / 2) + 'px';
      stage.style.marginTop = '-' + (canvasHeight / 2) + 'px';
    } else {
      scale = h / 430;
      if (932 * scale > w) {
        scale = w / 932;
      }
      stage.style.transform = 'scale(' + scale + ')';
      stage.style.transformOrigin = 'center center';
      stage.style.position = 'relative';
      stage.style.left = 'auto';
      stage.style.top = 'auto';
      stage.style.marginLeft = '0';
      stage.style.marginTop = '0';
      stage.style.width = '932px';
      stage.style.height = '430px';
    }
    
    window.logicWidth = isPortrait ? h / scale : w / scale;
  }
  
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', resize);
  resize();
  
  // 滚动和拖动逻辑
  let scrollX = 0;
  window.completedQuizIds = new Set();
  
  const getScrollLimit = () => {
    const quizzes = data.components
      .filter(c => c.type === 'quiz')
      .sort((a, b) => a.style.left - b.style.left);
    
    const nextUnfinished = quizzes.find(q => !window.completedQuizIds.has(q.id));
    const maxPossible = Math.max(0, data.pageConfig.width - 932);
    
    if (nextUnfinished) {
      if (nextUnfinished.props && nextUnfinished.props.lockX !== undefined && nextUnfinished.props.lockX !== null && nextUnfinished.props.lockX !== '') {
         return Math.min(maxPossible, Number(nextUnfinished.props.lockX));
      }
      return Math.min(maxPossible, nextUnfinished.style.left);
    }
    return maxPossible;
  };

  let drag = { isDown: false, startX: 0, startScroll: 0, velocity: 0, lastX: 0, rafId: null };
  
  const getX = e => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    if (window.isPortrait) return clientY;
    return clientX;
  };
  
  const updateView = () => {
    data.components.forEach(item => {
      const el = document.querySelector('[data-id="' + item.id + '"]');
      if (el) {
        el.style.transform = 'translate3d(' + (item.style.left - scrollX * item.parallax) + 'px, ' + item.style.top + 'px, 0)';
      }
    });
  };
  
  const start = e => {
    cancelAnimationFrame(drag.rafId);
    drag.isDown = true;
    drag.startX = getX(e);
    drag.startScroll = scrollX;
    drag.lastX = getX(e);
    drag.velocity = 0;
  };
  
  const move = e => {
    if (!drag.isDown) return;
    if (e.touches) e.preventDefault();
    const cx = getX(e);
    drag.velocity = cx - drag.lastX;
    drag.lastX = cx;
    let t = drag.startScroll - (cx - drag.startX);
    t = Math.max(0, Math.min(t, getScrollLimit()));
    scrollX = t;
    updateView();
  };

  const end = () => {
    if (!drag.isDown) return;
    drag.isDown = false;
    startInertia();
  };

  const startInertia = () => {
    if (Math.abs(drag.velocity) < 1) return;
    const step = () => {
      drag.velocity *= 0.95;
      if (Math.abs(drag.velocity) < 0.5) {
        cancelAnimationFrame(drag.rafId);
        return;
      }
      let t = scrollX - drag.velocity;
      const limit = getScrollLimit();
      if (t < 0) {
        t = 0;
        drag.velocity = 0;
      } else if (t > limit) {
        t = limit;
        drag.velocity = 0;
      }
      scrollX = t;
      updateView();
      drag.rafId = requestAnimationFrame(step);
    };
    step();
  };
  
  document.addEventListener('mousedown', start);
  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', end);
  document.addEventListener('mouseleave', end);
  document.addEventListener('touchstart', start, { passive: false });
  document.addEventListener('touchmove', move, { passive: false });
  document.addEventListener('touchend', end);
  
  updateView();
  
  // 提示功能
  window.showToast = (msg, duration = 2000) => {
    let toast = document.querySelector('.custom-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'custom-toast';
      document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.classList.add('show');
    
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  };
  
  // 答题逻辑
  function startQuiz(item) {
    const div = document.createElement('div');
    div.className = 'quiz-modal';
    let step = 0;
    
    // CSS媒体查询会处理旋转，这里只需确保大小正确
    if (window.isPortrait) {
      div.style.width = window.screenHeight + 'px';
      div.style.height = window.screenWidth + 'px';
    }
    
    const render = () => {
      const q = item.props.questions[step];
      let html = '<div class="quiz-card"><h3>' + q.title + '</h3>';
      html += '<div class="quiz-options-grid">';
      q.options.forEach((o, i) => {
        html += '<div class="quiz-opt" onclick="check(' + i + ')" style="min-height:44px;display:flex;align-items:center;padding:12px;">' + o + '</div>';
      });
      html += '</div></div>';
      div.innerHTML = html;
    };
    
    window.check = (i) => {
      if (i === item.props.questions[step].correctIndex) {
        step++;
        if (step >= item.props.questions.length) {
          // showToast('🎉 恭喜通关!');
          setTimeout(() => {
            div.remove();
            finishQuiz(item);
          }, 500);
        } else {
          render();
        }
      } else {
        showToast('💡 再试一次!');
      }
    };
    
    document.body.appendChild(div);
    render();
  }

  // 答题完成后的跳转逻辑
  function finishQuiz(currentItem) {
    window.completedQuizIds.add(currentItem.id);
    
    // 0. Check for URL jump
    if (currentItem.props.jumpUrl && currentItem.props.jumpUrl.trim() !== '') {
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        const rotation = window.isPortrait ? 'rotate(90deg)' : 'none';
        loading.innerHTML = `
          <div class="loading-rotator" style="display:flex; flex-direction:column; align-items:center; transform: ${rotation}">
            <div class="spinner"></div>
            <div style="color:white; margin-top:15px; font-weight:bold;">正在前往下一个关卡</div>
          </div>
        `;
        document.body.appendChild(loading);
        
        setTimeout(() => {
            window.location.href = currentItem.props.jumpUrl;
        }, 1500);
        return;
    }

    // 1. Check for manual jumpX
    if (currentItem.props.jumpX !== undefined && currentItem.props.jumpX !== null && currentItem.props.jumpX !== '') {
      performJump(Number(currentItem.props.jumpX));
      return;
    }

    // 2. Auto-detect next quiz layer
    const quizzes = data.components
      .filter(c => c.type === 'quiz')
      .sort((a, b) => a.style.left - b.style.left);
    
    const currentIndex = quizzes.findIndex(q => q.id === currentItem.id);
    
    if (currentIndex !== -1 && currentIndex < quizzes.length - 1) {
      const nextQuiz = quizzes[currentIndex + 1];
      const viewportW = 932;
      const targetX = Math.max(0, nextQuiz.style.left - (viewportW - nextQuiz.style.width) / 2);
      performJump(targetX);
    } else {
      // Last layer
      showCompletion();
    }
  }

  // 平滑跳转动画
  function performJump(targetX) {
    // 显示 Loading
    const loading = document.createElement('div');
    loading.className = 'loading-overlay';
    const rotation = window.isPortrait ? 'rotate(90deg)' : 'none';
    loading.innerHTML = `
      <div class="loading-rotator" style="display:flex; flex-direction:column; align-items:center; transform: ${rotation}">
        <div class="spinner"></div>
        <div style="color:white; margin-top:15px; font-weight:bold;">正在前往下一关...</div>
      </div>
    `;
    document.body.appendChild(loading);

    const startX = scrollX;
    const maxScroll = Math.max(0, data.pageConfig.width - 932);
    const finalTargetX = Math.max(0, Math.min(targetX, maxScroll));
    const distance = finalTargetX - startX;
    const duration = 500;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      if (elapsed < duration) {
        const progress = elapsed / duration;
        const ease = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        scrollX = startX + distance * ease;
        updateView();
        requestAnimationFrame(animate);
      } else {
        scrollX = finalTargetX;
        updateView();
        loading.remove();
      }
    };
    requestAnimationFrame(animate);
  }

  // 通关展示
  function showCompletion() {
    const div = document.createElement('div');
    div.className = 'completion-overlay';
    const rotation = window.isPortrait ? 'rotate(90deg)' : 'none';
    div.innerHTML = `
      <div class="completion-rotator" style="transform: ${rotation}">
        <div class="completion-card">
          <div style="font-size:50px;">🏆</div>
          <h2>恭喜通关!</h2>
          <p>你已经完成了所有关卡挑战</p>
          <button onclick="this.closest('.completion-overlay').remove()" style="background:#2196f3; color:white; border:none; padding:10px 30px; border-radius:20px; cursor:pointer; margin-top:20px;">
            完美谢幕
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(div);
  }
})();
