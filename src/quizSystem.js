/**
 * Quiz System - Educational questions after planet discovery
 * Reinforces learning with fun questions
 * Supports PT and EN languages
 */
import { i18n } from './i18n.js';
import * as storage from './utils/storage.js';

export class QuizSystem {
    constructor(xpSystem, audioManager) {
        this.xpSystem = xpSystem;
        this.audioManager = audioManager;
        this.quizzes = this.createQuizzes();
        this.answeredQuizzes = new Set();
        this.streak = 0;

        this.loadProgress();
    }

    createQuizzes() {
        return {
            pt: {
                'sun': [
                    {
                        question: 'Quanto da massa do Sistema Solar está no Sol?',
                        options: ['50%', '75%', '99%', '25%'],
                        correct: 2,
                        explanation: 'O Sol contém 99,86% de toda a massa do Sistema Solar! É ENORME!'
                    },
                    {
                        question: 'Quanto tempo demora a luz do Sol a chegar à Terra?',
                        options: ['1 segundo', '8 minutos', '1 hora', '1 dia'],
                        correct: 1,
                        explanation: 'A luz viaja a 300.000 km/s e demora cerca de 8 minutos!'
                    }
                ],
                'mercury': [
                    {
                        question: 'Mercúrio é o planeta mais _____ do Sistema Solar.',
                        options: ['Grande', 'Quente', 'Pequeno', 'Frio'],
                        correct: 2,
                        explanation: 'Mercúrio é o mais pequeno! É só um pouco maior que a nossa Lua.'
                    }
                ],
                'venus': [
                    {
                        question: 'Porque é que Vénus é o planeta mais quente?',
                        options: ['Está mais perto do Sol', 'Efeito de estufa', 'Tem vulcões', 'É feito de fogo'],
                        correct: 1,
                        explanation: 'O efeito de estufa da atmosfera densa aprisiona o calor! Chega a 464°C!'
                    },
                    {
                        question: 'Como é que Vénus roda?',
                        options: ['Igual aos outros', 'Ao contrário!', 'Não roda', 'Muito rápido'],
                        correct: 1,
                        explanation: 'Vénus roda ao contrário! O Sol nasce a Oeste e põe-se a Este.'
                    }
                ],
                'earth': [
                    {
                        question: 'Qual é a percentagem de água na superfície da Terra?',
                        options: ['30%', '50%', '70%', '90%'],
                        correct: 2,
                        explanation: '70% da Terra está coberta de água! Por isso parece azul do espaço.'
                    },
                    {
                        question: 'O que nos protege da radiação do Sol?',
                        options: ['As nuvens', 'O campo magnético', 'A Lua', 'O ar'],
                        correct: 1,
                        explanation: 'O campo magnético da Terra desvia as partículas perigosas do Sol!'
                    }
                ],
                'moon': [
                    {
                        question: 'Quantas pessoas já caminharam na Lua?',
                        options: ['2', '6', '12', '24'],
                        correct: 2,
                        explanation: '12 astronautas caminharam na Lua entre 1969 e 1972!'
                    }
                ],
                'mars': [
                    {
                        question: 'Porque é que Marte é vermelho?',
                        options: ['É muito quente', 'Óxido de ferro (ferrugem)', 'Lava', 'Areia vermelha do espaço'],
                        correct: 1,
                        explanation: 'Marte está coberto de óxido de ferro - é literalmente enferrujado!'
                    },
                    {
                        question: 'Qual é o nome do maior vulcão de Marte?',
                        options: ['Monte Marte', 'Monte Olimpo', 'Monte Vermelho', 'Monte Espacial'],
                        correct: 1,
                        explanation: 'O Monte Olimpo é o maior vulcão do Sistema Solar! 3x maior que o Evereste!'
                    }
                ],
                'jupiter': [
                    {
                        question: 'Quantas Terras cabem dentro de Júpiter?',
                        options: ['100', '500', '1300', '5000'],
                        correct: 2,
                        explanation: 'Cabem mais de 1300 Terras dentro de Júpiter! É GIGANTE!'
                    },
                    {
                        question: 'O que é a Grande Mancha Vermelha?',
                        options: ['Uma montanha', 'Uma tempestade gigante', 'Um vulcão', 'Uma lua'],
                        correct: 1,
                        explanation: 'É uma tempestade que dura há mais de 400 anos! É maior que a Terra!'
                    }
                ],
                'io': [
                    {
                        question: 'O que torna Io especial?',
                        options: ['Tem água', 'Tem vida', 'Tem centenas de vulcões', 'É feita de gelo'],
                        correct: 2,
                        explanation: 'Io é o corpo mais vulcânico do Sistema Solar! Está sempre em erupção.'
                    }
                ],
                'europa': [
                    {
                        question: 'O que pode estar escondido debaixo do gelo de Europa?',
                        options: ['Diamantes', 'Um oceano', 'Vulcões', 'Ouro'],
                        correct: 1,
                        explanation: 'Os cientistas acham que há um oceano líquido debaixo do gelo! Pode ter vida!'
                    }
                ],
                'ganymede': [
                    {
                        question: 'Ganimedes é maior que qual planeta?',
                        options: ['Marte', 'Terra', 'Mercúrio', 'Vénus'],
                        correct: 2,
                        explanation: 'Ganimedes é maior que Mercúrio! É a maior lua do Sistema Solar.'
                    }
                ],
                'saturn': [
                    {
                        question: 'De que são feitos os anéis de Saturno?',
                        options: ['Rochas e gelo', 'Gás', 'Poeira estelar', 'Metal'],
                        correct: 0,
                        explanation: 'Os anéis são bilhões de pedaços de gelo e rocha a orbitar Saturno!'
                    },
                    {
                        question: 'O que aconteceria se pusesses Saturno em água?',
                        options: ['Afundava', 'Flutuava!', 'Derretia', 'Explodia'],
                        correct: 1,
                        explanation: 'Saturno é menos denso que a água - flutuaria numa banheira gigante!'
                    }
                ],
                'titan': [
                    {
                        question: 'O que tem de especial a atmosfera de Titã?',
                        options: ['Não tem atmosfera', 'É a única lua com atmosfera densa', 'É feita de oxigénio', 'É transparente'],
                        correct: 1,
                        explanation: 'Titã é a única lua com uma atmosfera espessa! Tem até lagos de metano!'
                    }
                ],
                'mimas': [
                    {
                        question: 'A que se parece Mimas?',
                        options: ['Uma bola de ténis', 'A Estrela da Morte', 'Um ovo', 'Uma maçã'],
                        correct: 1,
                        explanation: 'A enorme cratera Herschel faz Mimas parecer a Estrela da Morte do Star Wars!'
                    }
                ],
                'uranus': [
                    {
                        question: 'O que é estranho na rotação de Úrano?',
                        options: ['Não roda', 'Roda deitado', 'Roda ao contrário', 'Roda muito devagar'],
                        correct: 1,
                        explanation: 'Úrano está praticamente deitado! O seu eixo está quase horizontal.'
                    },
                    {
                        question: 'Porque é que Úrano é azul-esverdeado?',
                        options: ['Tem oceanos', 'Metano na atmosfera', 'É muito frio', 'Reflecte a Terra'],
                        correct: 1,
                        explanation: 'O metano na atmosfera absorve luz vermelha, fazendo-o parecer azul!'
                    }
                ],
                'neptune': [
                    {
                        question: 'Qual a velocidade dos ventos em Neptuno?',
                        options: ['100 km/h', '500 km/h', '2100 km/h', '50 km/h'],
                        correct: 2,
                        explanation: 'Os ventos em Neptuno chegam a 2100 km/h! São os mais fortes do Sistema Solar!'
                    }
                ],
                'triton': [
                    {
                        question: 'O que é especial na órbita de Tritão?',
                        options: ['É quadrada', 'Vai na direcção oposta', 'É muito rápida', 'Muda de tamanho'],
                        correct: 1,
                        explanation: 'Tritão orbita ao contrário! Provavelmente foi capturado por Neptuno.'
                    }
                ],
                'pluto': [
                    {
                        question: 'O que aconteceu a Plutão em 2006?',
                        options: ['Explodiu', 'Foi despromovido a planeta anão', 'Foi descoberto', 'Colidiu com Neptuno'],
                        correct: 1,
                        explanation: 'Em 2006, os cientistas decidiram que Plutão é um planeta anão!'
                    },
                    {
                        question: 'Que forma tem a marca famosa na superfície de Plutão?',
                        options: ['Uma estrela', 'Um coração', 'Um círculo', 'Um triângulo'],
                        correct: 1,
                        explanation: 'Plutão tem uma enorme mancha em forma de coração chamada Tombaugh Regio!'
                    }
                ],
                'ceres': [
                    {
                        question: 'Onde fica Ceres no Sistema Solar?',
                        options: ['Depois de Neptuno', 'Entre Marte e Júpiter', 'Perto do Sol', 'Entre Saturno e Úrano'],
                        correct: 1,
                        explanation: 'Ceres está no cinturão de asteroides, entre Marte e Júpiter!'
                    }
                ],
                'eris': [
                    {
                        question: 'Porque é que a descoberta de Éris foi tão importante?',
                        options: ['Tem vida', 'Fez Plutão perder o título de planeta', 'É maior que a Terra', 'Tem anéis bonitos'],
                        correct: 1,
                        explanation: 'Éris é tão grande como Plutão, e a sua descoberta levou os cientistas a criar a categoria de planeta anão!'
                    }
                ]
            },
            en: {
                'sun': [
                    {
                        question: 'How much of the Solar System\'s mass is in the Sun?',
                        options: ['50%', '75%', '99%', '25%'],
                        correct: 2,
                        explanation: 'The Sun contains 99.86% of all mass in the Solar System! It\'s HUGE!'
                    },
                    {
                        question: 'How long does light from the Sun take to reach Earth?',
                        options: ['1 second', '8 minutes', '1 hour', '1 day'],
                        correct: 1,
                        explanation: 'Light travels at 300,000 km/s and takes about 8 minutes!'
                    }
                ],
                'mercury': [
                    {
                        question: 'Mercury is the _____ planet in the Solar System.',
                        options: ['Largest', 'Hottest', 'Smallest', 'Coldest'],
                        correct: 2,
                        explanation: 'Mercury is the smallest! It\'s only slightly larger than our Moon.'
                    }
                ],
                'venus': [
                    {
                        question: 'Why is Venus the hottest planet?',
                        options: ['It\'s closest to the Sun', 'Greenhouse effect', 'It has volcanoes', 'It\'s made of fire'],
                        correct: 1,
                        explanation: 'The greenhouse effect from its thick atmosphere traps heat! It reaches 464°C!'
                    },
                    {
                        question: 'How does Venus rotate?',
                        options: ['Like the others', 'Backwards!', 'It doesn\'t rotate', 'Very fast'],
                        correct: 1,
                        explanation: 'Venus rotates backwards! The Sun rises in the West and sets in the East.'
                    }
                ],
                'earth': [
                    {
                        question: 'What percentage of Earth\'s surface is covered by water?',
                        options: ['30%', '50%', '70%', '90%'],
                        correct: 2,
                        explanation: '70% of Earth is covered by water! That\'s why it looks blue from space.'
                    },
                    {
                        question: 'What protects us from the Sun\'s radiation?',
                        options: ['The clouds', 'The magnetic field', 'The Moon', 'The air'],
                        correct: 1,
                        explanation: 'Earth\'s magnetic field deflects dangerous particles from the Sun!'
                    }
                ],
                'moon': [
                    {
                        question: 'How many people have walked on the Moon?',
                        options: ['2', '6', '12', '24'],
                        correct: 2,
                        explanation: '12 astronauts walked on the Moon between 1969 and 1972!'
                    }
                ],
                'mars': [
                    {
                        question: 'Why is Mars red?',
                        options: ['It\'s very hot', 'Iron oxide (rust)', 'Lava', 'Red sand from space'],
                        correct: 1,
                        explanation: 'Mars is covered in iron oxide - it\'s literally rusty!'
                    },
                    {
                        question: 'What is the name of the largest volcano on Mars?',
                        options: ['Mount Mars', 'Olympus Mons', 'Mount Red', 'Mount Space'],
                        correct: 1,
                        explanation: 'Olympus Mons is the largest volcano in the Solar System! 3x taller than Everest!'
                    }
                ],
                'jupiter': [
                    {
                        question: 'How many Earths can fit inside Jupiter?',
                        options: ['100', '500', '1300', '5000'],
                        correct: 2,
                        explanation: 'More than 1300 Earths can fit inside Jupiter! It\'s GIGANTIC!'
                    },
                    {
                        question: 'What is the Great Red Spot?',
                        options: ['A mountain', 'A giant storm', 'A volcano', 'A moon'],
                        correct: 1,
                        explanation: 'It\'s a storm that has been raging for over 400 years! It\'s bigger than Earth!'
                    }
                ],
                'io': [
                    {
                        question: 'What makes Io special?',
                        options: ['It has water', 'It has life', 'It has hundreds of volcanoes', 'It\'s made of ice'],
                        correct: 2,
                        explanation: 'Io is the most volcanic body in the Solar System! It\'s always erupting.'
                    }
                ],
                'europa': [
                    {
                        question: 'What might be hidden under Europa\'s ice?',
                        options: ['Diamonds', 'An ocean', 'Volcanoes', 'Gold'],
                        correct: 1,
                        explanation: 'Scientists think there\'s a liquid ocean under the ice! It might have life!'
                    }
                ],
                'ganymede': [
                    {
                        question: 'Ganymede is bigger than which planet?',
                        options: ['Mars', 'Earth', 'Mercury', 'Venus'],
                        correct: 2,
                        explanation: 'Ganymede is bigger than Mercury! It\'s the largest moon in the Solar System.'
                    }
                ],
                'saturn': [
                    {
                        question: 'What are Saturn\'s rings made of?',
                        options: ['Rocks and ice', 'Gas', 'Star dust', 'Metal'],
                        correct: 0,
                        explanation: 'The rings are billions of pieces of ice and rock orbiting Saturn!'
                    },
                    {
                        question: 'What would happen if you put Saturn in water?',
                        options: ['It would sink', 'It would float!', 'It would melt', 'It would explode'],
                        correct: 1,
                        explanation: 'Saturn is less dense than water - it would float in a giant bathtub!'
                    }
                ],
                'titan': [
                    {
                        question: 'What\'s special about Titan\'s atmosphere?',
                        options: ['It has no atmosphere', 'It\'s the only moon with a thick atmosphere', 'It\'s made of oxygen', 'It\'s transparent'],
                        correct: 1,
                        explanation: 'Titan is the only moon with a thick atmosphere! It even has methane lakes!'
                    }
                ],
                'mimas': [
                    {
                        question: 'What does Mimas look like?',
                        options: ['A tennis ball', 'The Death Star', 'An egg', 'An apple'],
                        correct: 1,
                        explanation: 'The huge Herschel crater makes Mimas look like the Death Star from Star Wars!'
                    }
                ],
                'uranus': [
                    {
                        question: 'What\'s strange about Uranus\'s rotation?',
                        options: ['It doesn\'t rotate', 'It rotates on its side', 'It rotates backwards', 'It rotates very slowly'],
                        correct: 1,
                        explanation: 'Uranus is practically lying on its side! Its axis is almost horizontal.'
                    },
                    {
                        question: 'Why is Uranus blue-green?',
                        options: ['It has oceans', 'Methane in the atmosphere', 'It\'s very cold', 'It reflects Earth'],
                        correct: 1,
                        explanation: 'Methane in the atmosphere absorbs red light, making it appear blue!'
                    }
                ],
                'neptune': [
                    {
                        question: 'How fast are the winds on Neptune?',
                        options: ['100 km/h', '500 km/h', '2100 km/h', '50 km/h'],
                        correct: 2,
                        explanation: 'Winds on Neptune reach 2100 km/h! They\'re the strongest in the Solar System!'
                    }
                ],
                'triton': [
                    {
                        question: 'What\'s special about Triton\'s orbit?',
                        options: ['It\'s square', 'It goes in the opposite direction', 'It\'s very fast', 'It changes size'],
                        correct: 1,
                        explanation: 'Triton orbits backwards! It was probably captured by Neptune.'
                    }
                ],
                'pluto': [
                    {
                        question: 'What happened to Pluto in 2006?',
                        options: ['It exploded', 'It was demoted to a dwarf planet', 'It was discovered', 'It crashed into Neptune'],
                        correct: 1,
                        explanation: 'In 2006, scientists decided that Pluto is a dwarf planet!'
                    },
                    {
                        question: 'What shape is the famous mark on Pluto\'s surface?',
                        options: ['A star', 'A heart', 'A circle', 'A triangle'],
                        correct: 1,
                        explanation: 'Pluto has a huge heart-shaped area called Tombaugh Regio!'
                    }
                ],
                'ceres': [
                    {
                        question: 'Where is Ceres located in the Solar System?',
                        options: ['Beyond Neptune', 'Between Mars and Jupiter', 'Near the Sun', 'Between Saturn and Uranus'],
                        correct: 1,
                        explanation: 'Ceres is in the asteroid belt, between Mars and Jupiter!'
                    }
                ],
                'eris': [
                    {
                        question: 'Why was the discovery of Eris so important?',
                        options: ['It has life', 'It made Pluto lose its planet title', 'It\'s bigger than Earth', 'It has beautiful rings'],
                        correct: 1,
                        explanation: 'Eris is as big as Pluto, and its discovery led scientists to create the dwarf planet category!'
                    }
                ]
            }
        };
    }

    loadProgress() {
        const saved = storage.getItem('quizzes', null);
        if (saved) {
            this.answeredQuizzes = new Set(saved);
        }
        const savedStreak = storage.getItem('quizStreak', 0);
        this.streak = typeof savedStreak === 'number' ? savedStreak : 0;
    }

    saveProgress() {
        storage.setItem('quizzes', [...this.answeredQuizzes]);
        storage.setItem('quizStreak', this.streak);
    }

    getQuizzesForLang() {
        const lang = i18n.lang || 'pt';
        return this.quizzes[lang] || this.quizzes['pt'];
    }

    hasQuiz(planetName) {
        const quizzes = this.getQuizzesForLang();
        return quizzes[planetName] && quizzes[planetName].length > 0;
    }

    getQuiz(planetName) {
        const quizzes = this.getQuizzesForLang()[planetName];
        if (!quizzes) return null;
        
        // Get unanswered quiz
        for (let i = 0; i < quizzes.length; i++) {
            const quizId = `${planetName}_${i}`;
            if (!this.answeredQuizzes.has(quizId)) {
                return { ...quizzes[i], id: quizId };
            }
        }
        
        // All answered, return random one for replay (no XP)
        const randomIndex = Math.floor(Math.random() * quizzes.length);
        return { ...quizzes[randomIndex], id: `${planetName}_${randomIndex}`, replay: true };
    }

    /**
     * Returns quiz data for the info panel slide without creating any DOM.
     * @param {string} planetName - Internal planet key
     * @returns {{ question: string, options: string[], correctIndex: number, id: string, replay: boolean, answered: boolean } | null}
     */
    getQuizForSlide(planetName) {
        const quizzes = this.getQuizzesForLang()[planetName];
        if (!quizzes || quizzes.length === 0) return null;

        // Try to find an unanswered quiz
        for (let i = 0; i < quizzes.length; i++) {
            const quizId = `${planetName}_${i}`;
            if (!this.answeredQuizzes.has(quizId)) {
                const shuffled = this.shuffleWithCorrect(quizzes[i].options, quizzes[i].correct);
                return {
                    question: quizzes[i].question,
                    options: shuffled.options,
                    correctIndex: shuffled.correctIndex,
                    explanation: quizzes[i].explanation,
                    id: quizId,
                    replay: false,
                    answered: false
                };
            }
        }

        // All answered - return first quiz as answered/replay
        const firstQuiz = quizzes[0];
        const shuffled = this.shuffleWithCorrect(firstQuiz.options, firstQuiz.correct);
        return {
            question: firstQuiz.question,
            options: shuffled.options,
            correctIndex: shuffled.correctIndex,
            explanation: firstQuiz.explanation,
            id: `${planetName}_0`,
            replay: true,
            answered: true
        };
    }

    /**
     * Record a correct answer: increment streak.
     */
    recordCorrectAnswer(quizId) {
        this.answeredQuizzes.add(quizId);
        this.streak++;
        this.saveProgress();

        // Award XP
        if (this.xpSystem) {
            this.xpSystem.addXP(25, i18n.lang === 'en' ? 'Correct quiz' : 'Quiz correcto');
        }
    }

    /**
     * Record a wrong answer: reset streak.
     */
    recordWrongAnswer() {
        this.streak = 0;
        this.saveProgress();
    }

    showQuiz(planetName, onComplete) {
        const quiz = this.getQuiz(planetName);
        if (!quiz) {
            onComplete(false);
            return;
        }

        const lang = i18n.lang || 'pt';
        const texts = {
            pt: {
                correct: 'Excelente! Resposta Certa!',
                wrong: 'Quase! A resposta certa era diferente.',
                continue: 'Continuar 🚀',
                quizXp: 'Quiz correcto'
            },
            en: {
                correct: 'Excellent! Correct Answer!',
                wrong: 'Almost! The correct answer was different.',
                continue: 'Continue 🚀',
                quizXp: 'Correct quiz'
            }
        };
        const t = texts[lang] || texts['pt'];

        const overlay = document.createElement('div');
        overlay.className = 'quiz-overlay';
        
        const shuffledOptions = this.shuffleWithCorrect(quiz.options, quiz.correct);
        
        overlay.innerHTML = `
            <div class="quiz-container">
                <div class="quiz-header">
                    <span class="quiz-planet">${planetName}</span>
                    <span class="quiz-badge">❓ QUIZ</span>
                </div>
                <div class="quiz-question">
                    <p>${quiz.question}</p>
                </div>
                <div class="quiz-options">
                    ${shuffledOptions.options.map((opt, i) => `
                        <button class="quiz-option" data-index="${i}" data-correct="${i === shuffledOptions.correctIndex}">
                            <span class="option-letter">${String.fromCharCode(65 + i)}</span>
                            <span class="option-text">${opt}</span>
                        </button>
                    `).join('')}
                </div>
                <div class="quiz-result hidden">
                    <div class="result-icon"></div>
                    <p class="result-text"></p>
                    <p class="result-explanation">${quiz.explanation}</p>
                    <button class="quiz-continue">${t.continue}</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        
        // Animate in
        requestAnimationFrame(() => {
            overlay.classList.add('visible');
        });

        // Handle option clicks
        const options = overlay.querySelectorAll('.quiz-option');
        const resultDiv = overlay.querySelector('.quiz-result');
        const optionsDiv = overlay.querySelector('.quiz-options');
        
        options.forEach(btn => {
            btn.addEventListener('click', () => {
                const isCorrect = btn.dataset.correct === 'true';
                
                // Disable all options
                options.forEach(o => o.disabled = true);
                
                // Show result
                btn.classList.add(isCorrect ? 'correct' : 'wrong');
                
                // Show correct answer if wrong
                if (!isCorrect) {
                    options.forEach(o => {
                        if (o.dataset.correct === 'true') {
                            o.classList.add('correct');
                        }
                    });
                }
                
                // Update result display
                resultDiv.querySelector('.result-icon').textContent = isCorrect ? '🎉' : '😅';
                resultDiv.querySelector('.result-text').textContent = isCorrect ? t.correct : t.wrong;
                
                // Play sound
                if (this.audioManager) {
                    if (isCorrect) {
                        this.audioManager.playSuccess();
                    } else {
                        this.audioManager.playTone(200, 'sine', 0.3);
                    }
                }

                // Trigger mascot reaction
                window.dispatchEvent(new CustomEvent(isCorrect ? 'app:quiz-correct' : 'app:quiz-wrong'));

                // Award XP for correct answer (if not replay)
                if (isCorrect && !quiz.replay) {
                    this.answeredQuizzes.add(quiz.id);
                    this.saveProgress();
                    
                    if (this.xpSystem) {
                        setTimeout(() => {
                            this.xpSystem.addXP(25, t.quizXp);
                        }, 500);
                    }
                }
                
                // Show result section
                setTimeout(() => {
                    optionsDiv.classList.add('hidden');
                    resultDiv.classList.remove('hidden');
                }, 800);
            });
        });

        // Continue button
        overlay.querySelector('.quiz-continue').addEventListener('click', () => {
            overlay.classList.add('fade-out');
            setTimeout(() => {
                overlay.remove();
                onComplete(true);
            }, 400);
        });
    }

    shuffleWithCorrect(options, correctIndex) {
        const correct = options[correctIndex];
        const shuffled = [...options].sort(() => Math.random() - 0.5);
        const newCorrectIndex = shuffled.indexOf(correct);
        
        return {
            options: shuffled,
            correctIndex: newCorrectIndex
        };
    }
}
