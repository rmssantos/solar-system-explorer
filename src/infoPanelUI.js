/**
 * Manages the Info Panel: slide-based planet/object information display.
 */
import { i18n } from './i18n.js';
import { TTSManager } from './ttsManager.js';

export class InfoPanelUI {
    constructor(app) {
        this.app = app;

        // Panel DOM references
        this.infoPanel = document.getElementById('info-panel');
        this.infoTitle = document.getElementById('info-title');
        this.infoContent = document.getElementById('info-content');

        // Slide state
        this.currentSlideData = null;
        this.currentObjectKey = null;
        this.currentSlideIndex = 0;
        this.slides = [];

        // TTS
        this.tts = new TTSManager();
    }

    show(objectName, data, navigationList) {
        if (!data) return;

        this.infoTitle.innerText = data.name;
        this.infoContent.innerHTML = '';
        this.infoPanel.classList.remove('hidden');

        // Setup Slides logic
        this.currentSlideData = data;
        this.currentObjectKey = objectName;
        this.currentSlideIndex = 0;
        this.slides = this.buildSlides(data);

        this.renderSlide();
    }

    close() {
        this.infoPanel.classList.add('hidden');
        // Stop TTS when panel closes
        this.tts.stop();
        // Stop planet ambient sound when closing info panel
        this.app.audioManager?.stopPlanetAmbient();
    }

    buildSlides(data) {
        const slides = [];
        const lang = i18n.lang || 'pt';

        // Slide 1: Basic Stats
        slides.push({
            title: i18n.t('slide_basic_data'),
            content: (container) => {
                if (data.type) this.createRow(container, i18n.t('info_type'), data.type);
                if (data.avgDistanceFromSun) this.createRow(container, i18n.t('info_distance'), `${data.avgDistanceFromSun} M km`);
                if (data.distanceKm) this.createRow(container, i18n.t('slide_distance'), `${data.distanceKm} km`);
            }
        });

        // Slide 2: Real Photo
        if (data.realPhoto) {
            slides.push({
                title: i18n.t('slide_real_photo'),
                content: (container) => {
                    const photoContainer = document.createElement('div');
                    photoContainer.className = 'real-photo-container';

                    // Support for multiple photos (array)
                    const photos = Array.isArray(data.realPhoto) ? data.realPhoto : [data.realPhoto];
                    let currentPhotoIndex = 0;

                    const img = document.createElement('img');
                    img.src = photos[0];
                    img.alt = data.name;
                    img.className = 'real-photo';
                    img.loading = 'lazy';

                    // Add loading state
                    img.onload = () => {
                        img.classList.add('loaded');
                    };
                    img.onerror = () => {
                        photoContainer.innerHTML = `<p style="color: #888; text-align: center;">${lang === 'en' ? 'Photo not available' : 'Foto n\u00e3o dispon\u00edvel'}</p>`;
                    };

                    photoContainer.appendChild(img);

                    // Add navigation for multiple photos
                    if (photos.length > 1) {
                        const navContainer = document.createElement('div');
                        navContainer.className = 'photo-nav';

                        const prevBtn = document.createElement('button');
                        prevBtn.className = 'photo-nav-btn';
                        prevBtn.innerHTML = '\u25C0';
                        prevBtn.onclick = () => {
                            currentPhotoIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
                            img.classList.remove('loaded');
                            img.src = photos[currentPhotoIndex];
                            counter.textContent = `${currentPhotoIndex + 1} / ${photos.length}`;
                        };

                        const counter = document.createElement('span');
                        counter.className = 'photo-counter';
                        counter.textContent = `1 / ${photos.length}`;

                        const nextBtn = document.createElement('button');
                        nextBtn.className = 'photo-nav-btn';
                        nextBtn.innerHTML = '\u25B6';
                        nextBtn.onclick = () => {
                            currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
                            img.classList.remove('loaded');
                            img.src = photos[currentPhotoIndex];
                            counter.textContent = `${currentPhotoIndex + 1} / ${photos.length}`;
                        };

                        navContainer.appendChild(prevBtn);
                        navContainer.appendChild(counter);
                        navContainer.appendChild(nextBtn);
                        photoContainer.appendChild(navContainer);
                    }

                    // Add credit
                    const credit = document.createElement('p');
                    credit.className = 'photo-credit';
                    credit.innerHTML = lang === 'en'
                        ? '\uD83D\uDCF7 Image: NASA/ESA/Wikimedia Commons'
                        : '\uD83D\uDCF7 Imagem: NASA/ESA/Wikimedia Commons';
                    photoContainer.appendChild(credit);

                    container.appendChild(photoContainer);
                }
            });
        }

        // Slide 3: Climate & Time
        slides.push({
            title: i18n.t('slide_climate_time'),
            content: (container) => {
                if (data.dayLength) this.createRow(container, i18n.t('info_day'), data.dayLength);
                if (data.yearLength) this.createRow(container, i18n.t('info_year'), data.yearLength);
                if (data.avgTemperature) this.createRow(container, i18n.t('info_temp'), data.avgTemperature);
            }
        });

        // Slide: WOW Facts for Kids!
        if (data.wowFacts && data.wowFacts.length > 0) {
            slides.push({
                title: i18n.t('info_wow_facts'),
                content: (container) => {
                    const wowContainer = document.createElement('div');
                    wowContainer.className = 'wow-facts';

                    // Show 2 random facts
                    const shuffled = [...data.wowFacts].sort(() => Math.random() - 0.5);
                    const factsToShow = shuffled.slice(0, 2);

                    factsToShow.forEach(fact => {
                        const factDiv = document.createElement('div');
                        factDiv.className = 'wow-fact';
                        factDiv.textContent = fact;
                        wowContainer.appendChild(factDiv);
                    });

                    // Add comparison if exists
                    if (data.comparison) {
                        const compDiv = document.createElement('div');
                        compDiv.className = 'wow-comparison';
                        compDiv.textContent = `\uD83D\uDCCF ${data.comparison}`;
                        wowContainer.appendChild(compDiv);
                    }

                    container.appendChild(wowContainer);
                }
            });
        }

        // Slide: Curiosities
        if (data.trivia && data.trivia.length > 0) {
            slides.push({
                title: i18n.t('info_curiosities'),
                content: (container) => {
                    const ul = document.createElement('ul');
                    ul.className = 'curiosities-list';
                    data.trivia.forEach(c => {
                        const li = document.createElement('li');
                        li.innerText = c;
                        ul.appendChild(li);
                    });
                    container.appendChild(ul);
                }
            });
        }

        // Slide: Description (Final)
        if (data.description) {
            slides.push({
                title: i18n.t('slide_about'),
                content: (container) => {
                    const p = document.createElement('p');
                    p.className = 'info-desc';
                    p.innerText = data.description;
                    container.appendChild(p);
                }
            });
        }

        // Slide: Quiz (if available)
        const quizSystem = this.app.quizSystem;
        if (quizSystem) {
            const objectKey = this.currentObjectKey;
            const quizData = quizSystem.getQuizForSlide(objectKey);
            if (quizData) {
                slides.push({
                    title: i18n.t('quiz_slide_title'),
                    content: (container) => {
                        this.renderQuizSlide(container, quizData, quizSystem);
                    }
                });
            }
        }

        return slides;
    }

    renderQuizSlide(container, quizData, quizSystem) {
        const quizContainer = document.createElement('div');
        quizContainer.className = 'quiz-slide-container';

        // Streak badge
        if (quizSystem.streak >= 1) {
            const streakBadge = document.createElement('div');
            streakBadge.className = 'quiz-streak-badge';
            const streakText = i18n.t('quiz_streak').replace('{count}', quizSystem.streak);
            streakBadge.textContent = streakText;
            if (quizSystem.streak >= 5) {
                const cosmicLabel = document.createElement('span');
                cosmicLabel.className = 'quiz-streak-label cosmic';
                cosmicLabel.textContent = i18n.t('quiz_cosmic_brain');
                streakBadge.appendChild(cosmicLabel);
            } else if (quizSystem.streak >= 3) {
                const geniusLabel = document.createElement('span');
                geniusLabel.className = 'quiz-streak-label genius';
                geniusLabel.textContent = i18n.t('quiz_space_genius');
                streakBadge.appendChild(geniusLabel);
            }
            quizContainer.appendChild(streakBadge);
        }

        // Already answered state
        if (quizData.answered) {
            const answeredMsg = document.createElement('div');
            answeredMsg.className = 'quiz-slide-answered';
            answeredMsg.textContent = i18n.t('quiz_already_answered');
            quizContainer.appendChild(answeredMsg);

            // Show question
            const questionDiv = document.createElement('div');
            questionDiv.className = 'quiz-slide-question';
            questionDiv.textContent = quizData.question;
            quizContainer.appendChild(questionDiv);

            // Show options with correct highlighted
            const optionsDiv = document.createElement('div');
            optionsDiv.className = 'quiz-slide-options';
            const letters = ['A', 'B', 'C', 'D'];
            const optionColors = ['blue', 'green', 'orange', 'purple'];
            quizData.options.forEach((opt, i) => {
                const btn = document.createElement('button');
                btn.className = `quiz-slide-option quiz-slide-option-${optionColors[i]}`;
                btn.disabled = true;
                if (i === quizData.correctIndex) {
                    btn.classList.add('quiz-option-correct');
                }
                btn.innerHTML = `<span class="quiz-slide-letter">${letters[i]}</span><span class="quiz-slide-option-text">${opt}</span>`;
                optionsDiv.appendChild(btn);
            });
            quizContainer.appendChild(optionsDiv);

            container.appendChild(quizContainer);
            return;
        }

        // Question
        const questionDiv = document.createElement('div');
        questionDiv.className = 'quiz-slide-question';
        questionDiv.textContent = quizData.question;
        quizContainer.appendChild(questionDiv);

        // Options
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'quiz-slide-options';
        const letters = ['A', 'B', 'C', 'D'];
        const optionColors = ['blue', 'green', 'orange', 'purple'];
        let answered = false;

        quizData.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = `quiz-slide-option quiz-slide-option-${optionColors[i]}`;
            btn.innerHTML = `<span class="quiz-slide-letter">${letters[i]}</span><span class="quiz-slide-option-text">${opt}</span>`;

            btn.addEventListener('click', () => {
                if (answered) return;
                answered = true;

                const isCorrect = i === quizData.correctIndex;

                // Disable all buttons
                const allBtns = optionsDiv.querySelectorAll('.quiz-slide-option');
                allBtns.forEach(b => { b.disabled = true; });

                if (isCorrect) {
                    btn.classList.add('quiz-option-correct');
                    // Record correct answer
                    if (!quizData.replay) {
                        quizSystem.recordCorrectAnswer(quizData.id);
                    }

                    // Play success sound
                    if (this.app.audioManager) {
                        this.app.audioManager.playSuccess();
                    }

                    // Trigger mascot reaction
                    window.dispatchEvent(new CustomEvent('app:quiz-correct'));

                    // Show feedback
                    this.showQuizFeedback(quizContainer, true, quizData, quizSystem);

                    // Confetti burst
                    if (this.app.uiManager?.celebrationUI) {
                        this.app.uiManager.celebrationUI.explodeConfetti();
                    }

                    // Check quiz achievements
                    if (this.app.achievementSystem) {
                        const quizCount = quizSystem.answeredQuizzes.size;
                        this.app.achievementSystem.checkQuizCount(quizCount);
                    }
                } else {
                    btn.classList.add('quiz-option-wrong');
                    // Highlight correct answer
                    allBtns[quizData.correctIndex].classList.add('quiz-option-correct');
                    // Record wrong answer (resets streak)
                    quizSystem.recordWrongAnswer();

                    // Play error sound
                    if (this.app.audioManager) {
                        this.app.audioManager.playTone(200, 'sine', 0.3);
                    }

                    // Trigger mascot reaction
                    window.dispatchEvent(new CustomEvent('app:quiz-wrong'));

                    // Show feedback
                    this.showQuizFeedback(quizContainer, false, quizData, quizSystem);
                }
            });

            optionsDiv.appendChild(btn);
        });
        quizContainer.appendChild(optionsDiv);

        container.appendChild(quizContainer);
    }

    showQuizFeedback(quizContainer, isCorrect, quizData, quizSystem) {
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'quiz-slide-feedback';

        if (isCorrect) {
            // Floating XP text
            const xpFloat = document.createElement('div');
            xpFloat.className = 'quiz-xp-float';
            xpFloat.textContent = i18n.t('quiz_xp_earned').replace('{xp}', '25');
            quizContainer.appendChild(xpFloat);

            const feedbackText = document.createElement('div');
            feedbackText.className = 'quiz-feedback-correct';
            feedbackText.textContent = i18n.t('quiz_correct_feedback');
            feedbackDiv.appendChild(feedbackText);

            // Show updated streak
            if (quizSystem.streak >= 1) {
                const streakDiv = document.createElement('div');
                streakDiv.className = 'quiz-streak-badge quiz-streak-animated';
                const streakText = i18n.t('quiz_streak').replace('{count}', quizSystem.streak);
                streakDiv.textContent = streakText;
                if (quizSystem.streak >= 5) {
                    const label = document.createElement('span');
                    label.className = 'quiz-streak-label cosmic';
                    label.textContent = i18n.t('quiz_cosmic_brain');
                    streakDiv.appendChild(label);
                } else if (quizSystem.streak >= 3) {
                    const label = document.createElement('span');
                    label.className = 'quiz-streak-label genius';
                    label.textContent = i18n.t('quiz_space_genius');
                    streakDiv.appendChild(label);
                }
                feedbackDiv.appendChild(streakDiv);
            }
        } else {
            const feedbackText = document.createElement('div');
            feedbackText.className = 'quiz-feedback-wrong';
            feedbackText.textContent = `${i18n.t('quiz_wrong_feedback')} ${quizData.options[quizData.correctIndex]}`;
            feedbackDiv.appendChild(feedbackText);

            // Learn more hint
            const learnMore = document.createElement('div');
            learnMore.className = 'quiz-learn-more';
            learnMore.textContent = i18n.t('quiz_learn_more');
            feedbackDiv.appendChild(learnMore);
        }

        quizContainer.appendChild(feedbackDiv);
    }

    renderSlide() {
        this.infoContent.innerHTML = '';
        // Stop TTS on slide change
        this.tts.stop();
        const slide = this.slides[this.currentSlideIndex];

        // Object Visual Preview (texture sphere or special image)
        if (this.currentSlideIndex === 0) {
            this.renderObjectPreview();
        }

        // Slide Title
        const h3 = document.createElement('h3');
        h3.innerText = slide.title;
        h3.className = 'slide-title';
        this.infoContent.appendChild(h3);

        // Content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'slide-content';
        slide.content(contentDiv);
        this.infoContent.appendChild(contentDiv);

        // TTS "Read to Me" button
        if (this.tts.isSupported()) {
            const ttsBtn = document.createElement('button');
            ttsBtn.className = 'tts-btn';
            ttsBtn.textContent = i18n.t('tts_read');
            ttsBtn.setAttribute('aria-label', i18n.t('tts_read'));
            ttsBtn.addEventListener('click', () => {
                const text = contentDiv.innerText || '';
                const isSpeaking = this.tts.toggle(text);
                ttsBtn.textContent = isSpeaking ? i18n.t('tts_stop') : i18n.t('tts_read');
                ttsBtn.classList.toggle('speaking', isSpeaking);
                ttsBtn.setAttribute('aria-label', isSpeaking ? i18n.t('tts_stop') : i18n.t('tts_read'));
            });
            this.infoContent.appendChild(ttsBtn);
        }

        // Buttons
        const controls = document.createElement('div');
        controls.className = 'slide-controls';

        // Prev Button
        if (this.currentSlideIndex > 0) {
            const btnPrev = document.createElement('button');
            btnPrev.className = 'modern-btn slide-btn';
            btnPrev.innerText = i18n.t('previous');
            btnPrev.onclick = () => {
                this.currentSlideIndex--;
                this.renderSlide();
            };
            controls.appendChild(btnPrev);
        }

        // Next/Finish Button
        const btnNext = document.createElement('button');
        btnNext.className = 'modern-btn slide-btn primary';

        const isLast = this.currentSlideIndex === this.slides.length - 1;
        const isVisited = this.app.gameManager ? this.app.gameManager.isVisited(this.currentObjectKey) : false;

        if (isLast) {
            if (isVisited) {
                btnNext.innerText = i18n.t('close');
                btnNext.onclick = () => this.close();
            } else {
                btnNext.innerText = i18n.t('discover_btn');
                btnNext.onclick = () => this.completeMission();
            }
        } else {
            btnNext.innerText = i18n.t('next') + ' \u27A1';
            btnNext.onclick = () => {
                this.currentSlideIndex++;
                this.renderSlide();
            };
        }
        controls.appendChild(btnNext);
        this.infoContent.appendChild(controls);

        // Progress Dots
        const dots = document.createElement('div');
        dots.className = 'slide-dots';
        this.slides.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.className = `dot ${i === this.currentSlideIndex ? 'active' : ''}`;
            dots.appendChild(dot);
        });
        this.infoContent.appendChild(dots);
    }

    createRow(container, label, value) {
        const div = document.createElement('div');
        div.className = 'info-item';
        div.innerHTML = `<span class="info-label">${label}</span><span class="info-value">${value}</span>`;
        container.appendChild(div);
    }

    completeMission() {
        if (!this.app.gameManager) return;

        // Use the object key for tracking, not the translated name
        const key = this.currentObjectKey;
        const displayName = this.currentSlideData.name;
        const isNew = this.app.gameManager.visit(key);

        if (isNew) {
            // Delegate celebration to UIManager - pass internal key for SOLAR_SYSTEM_DATA lookup
            this.app.uiManager.showCelebration(key);
            window.dispatchEvent(new CustomEvent('app:visit', { detail: key }));

            // Update passport visual immediately
            this.app.uiManager.updatePassport(key, true);

            // Re-render slide to show "Close" button instead of Discover
            this.renderSlide();
        }
    }

    renderObjectPreview() {
        const data = this.currentSlideData;
        if (!data) return;

        const previewContainer = document.createElement('div');
        previewContainer.className = 'object-preview';

        // Special case: Lua - show Apollo mission photos
        if (data.name === 'Lua' || data.id === 'moon') {
            this.renderMoonGallery(previewContainer);
        }
        // Special case: ET UFO
        else if (data.name?.includes('OVNI') || data.type === 'Nave Alien\u00edgena') {
            this.renderUFOPreview(previewContainer);
        }
        // Default: Show texture as rotating sphere preview
        else if (data.textureUrl) {
            const textureImg = document.createElement('div');
            textureImg.className = 'planet-preview';
            textureImg.innerHTML = `
                <div class="planet-sphere" style="background-image: url('${data.textureUrl}')"></div>
                <div class="planet-glow" style="--planet-color: #${(data.color || 0x4488ff).toString(16).padStart(6, '0')}"></div>
            `;
            previewContainer.appendChild(textureImg);
        }

        this.infoContent.appendChild(previewContainer);
    }

    renderMoonGallery(container) {
        const apolloPhotos = [
            {
                url: '/textures/apollo/aldrin.jpg',
                caption: 'Buzz Aldrin na Lua - Apollo 11, 1969',
                captionEN: 'Buzz Aldrin on the Moon - Apollo 11, 1969'
            },
            {
                url: '/textures/apollo/bootprint.jpg',
                caption: 'Pegada de astronauta que ainda l\u00e1 est\u00e1!',
                captionEN: 'Astronaut footprint that\'s still there!'
            },
            {
                url: '/textures/apollo/rover.jpg',
                caption: 'Carro lunar Apollo - ainda est\u00e1 na Lua!',
                captionEN: 'Apollo lunar rover - still on the Moon!'
            }
        ];

        const lang = i18n.lang || 'pt';
        const galleryTitle = document.createElement('div');
        galleryTitle.className = 'moon-gallery-title';
        galleryTitle.innerHTML = `\uD83D\uDCF8 ${lang === 'en' ? 'Real photos from the Moon!' : 'Fotos reais da Lua!'}`;
        container.appendChild(galleryTitle);

        const gallery = document.createElement('div');
        gallery.className = 'moon-gallery';

        apolloPhotos.forEach((photo) => {
            const photoDiv = document.createElement('div');
            photoDiv.className = 'moon-photo';
            photoDiv.innerHTML = `
                <img src="${photo.url}" alt="${lang === 'en' ? photo.captionEN : photo.caption}" loading="lazy">
                <span class="photo-caption">${lang === 'en' ? photo.captionEN : photo.caption}</span>
            `;
            photoDiv.onclick = () => this.showFullPhoto(photo, lang);
            gallery.appendChild(photoDiv);
        });

        container.appendChild(gallery);
    }

    showFullPhoto(photo, lang) {
        const modal = document.createElement('div');
        modal.className = 'photo-modal';
        modal.innerHTML = `
            <div class="photo-modal-content">
                <img src="${photo.url}" alt="Apollo Mission Photo">
                <p>${lang === 'en' ? photo.captionEN : photo.caption}</p>
                <button class="modern-btn">${lang === 'en' ? 'Close' : 'Fechar'}</button>
            </div>
        `;
        modal.onclick = (e) => {
            if (e.target === modal || e.target.tagName === 'BUTTON') {
                modal.remove();
            }
        };
        document.body.appendChild(modal);
    }

    renderUFOPreview(container) {
        const ufoVisual = document.createElement('div');
        ufoVisual.className = 'ufo-preview';
        ufoVisual.innerHTML = `
            <div class="ufo-animation">
                <span class="ufo-emoji">\uD83D\uDEF8</span>
                <div class="ufo-beam"></div>
            </div>
            <div class="ufo-message">
                <span class="alien-text">\uD83D\uDC7D ??? </span>
            </div>
        `;
        container.appendChild(ufoVisual);
    }
}
