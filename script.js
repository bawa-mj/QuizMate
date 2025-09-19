 // --- DOM Element Selection ---
        const setupScreen = document.getElementById('setup-screen');
        const studentNameInput = document.getElementById('student-name-input');
        const branchSelect = document.getElementById('branch-select');
        const yearSelect = document.getElementById('year-select');
        const subjectSelect = document.getElementById('subject-select');
        const difficultySelect = document.getElementById('difficulty-select');
        const countInput = document.getElementById('count-input');
        const startGameBtn = document.getElementById('start-game-btn');
        const setupError = document.getElementById('setup-error');

        const loadingScreen = document.getElementById('loading-screen');

        const gameScreen = document.getElementById('game-screen');
        const scoreEl = document.getElementById('score');
        const questionTextEl = document.getElementById('question-text');
        const optionsContainer = document.getElementById('options-container');
        const feedbackArea = document.getElementById('feedback-area');
        const nextQuestionBtn = document.getElementById('next-question-btn');

        const scoreScreen = document.getElementById('score-screen');
        const studentNameEl = document.getElementById('student-name');
        const finalPercentageEl = document.getElementById('final-percentage');
        const correctAnswersEl = document.getElementById('correct-answers');
        const totalQuestionsEl = document.getElementById('total-questions');
        const playAgainBtn = document.getElementById('play-again-btn');

        const chatbotWindow = document.getElementById('chatbot-window');
        const chatbotToggleBtn = document.getElementById('chatbot-toggle-btn');
        const chatMessages = document.getElementById('chat-messages');
        const chatForm = document.getElementById('chat-form');
        const chatInput = document.getElementById('chat-input');
        const chatSendBtn = document.getElementById('chat-send-btn');

        // --- Global Variables ---
        const apiKey = ""; // API key is handled by the platform
        let questions = [];
        let currentQuestionIndex = 0;
        let score = 0;
        let studentName = '';

        // --- Data for Dynamic Selects ---
        const subjectData = {
            "CSE": {
                "1st Year": ["Programming for Problem Solving", "Engineering Graphics & Design", "Basic Electrical Engineering", "Engineering Physics"],
                "2nd Year": ["Data Structures", "Computer Organization & Architecture", "Discrete Mathematics", "Object Oriented Programming"],
                "3rd Year": ["Database Management Systems", "Operating Systems", "Compiler Design", "Computer Networks"],
                "4th Year": ["Machine Learning", "Artificial Intelligence", "Cryptography & Network Security", "Cloud Computing"]
            },
            "AIML": {
                "1st Year": ["Programming for Problem Solving", "Linear Algebra", "Calculus", "Basic Electrical Engineering"],
                "2nd Year": ["Data Structures", "Probability & Statistics", "Python for Machine Learning", "Object Oriented Programming"],
                "3rd Year": ["Foundations of AI & ML", "Deep Learning", "Natural Language Processing", "Data Warehousing"],
                "4th Year": ["Reinforcement Learning", "Computer Vision", "MLOps", "AI Ethics"]
            },
            "ME": {
                "1st Year": ["Engineering Mechanics", "Thermodynamics", "Workshop Practice", "Engineering Chemistry"],
                "2nd Year": ["Strength of Materials", "Theory of Machines", "Fluid Mechanics", "Manufacturing Processes"],
                "3rd Year": ["Heat and Mass Transfer", "Machine Design", "IC Engines", "Mechatronics"],
                "4th Year": ["Robotics", "Finite Element Analysis", "Computational Fluid Dynamics", "Automobile Engineering"]
            },
            "ECE": {
                "1st Year": ["Basic Electronics Engineering", "Network Theory", "Engineering Physics", "Mathematics-I"],
                "2nd Year": ["Analog Circuits", "Digital Logic Design", "Signals and Systems", "Electromagnetic Theory"],
                "3rd Year": ["Microprocessors & Microcontrollers", "Digital Signal Processing", "Control Systems", "VLSI Design"],
                "4th Year": ["Embedded Systems", "Wireless Communication", "Optical Communication", "IoT and its Applications"]
            },
            "Civil": {
                "1st Year": ["Surveying", "Engineering Mechanics", "Building Materials", "Engineering Geology"],
                "2nd Year": ["Structural Analysis", "Geotechnical Engineering", "Fluid Mechanics", "Transportation Engineering"],
                "3rd Year": ["Design of Concrete Structures", "Environmental Engineering", "Water Resources Engineering", "Foundation Engineering"],
                "4th Year": ["Construction Management", "Earthquake Engineering", "Prestressed Concrete", "Bridge Engineering"]
            }
        };

        // --- Initial Screen Load ---
        document.addEventListener('DOMContentLoaded', () => {
            showScreen('setup');
            updateSubjects();
        });

        // --- Dynamic Subject Population ---
        branchSelect.addEventListener('change', updateSubjects);
        yearSelect.addEventListener('change', updateSubjects);

        function updateSubjects() {
            const selectedBranch = branchSelect.value;
            const selectedYear = yearSelect.value;

            subjectSelect.innerHTML = '<option value="" disabled selected>Select Subject</option>';
            subjectSelect.disabled = true;

            if (selectedBranch && selectedYear && subjectData[selectedBranch] && subjectData[selectedBranch][selectedYear]) {
                const subjects = subjectData[selectedBranch][selectedYear];
                subjects.forEach(subject => {
                    const option = document.createElement('option');
                    option.value = subject;
                    option.textContent = subject;
                    subjectSelect.appendChild(option);
                });
                subjectSelect.disabled = false;
            }
        }

        // --- Game Logic ---
        startGameBtn.addEventListener('click', async () => {
            studentName = studentNameInput.value.trim();
            const branch = branchSelect.value;
            const year = yearSelect.value;
            const subject = subjectSelect.value;
            const difficulty = difficultySelect.value;
            const count = parseInt(countInput.value, 10);

            // Validate required fields
            if (!studentName || !branch || !year || !subject || !count || count < 1 || count > 20) {
                setupError.textContent = 'Please fill in your name and select a branch, year, subject, and a valid question count (1-20).';
                setupError.classList.remove('hidden');
                return;
            }
            setupError.classList.add('hidden');
            showScreen('loading');

            const prompt = `Generate ${count} ${difficulty} level multiple-choice questions for a ${year} student in the "${branch}" engineering branch. The questions should be on the subject "${subject}". Provide the response as a valid JSON array. Each object must have "question" (string), "options" (array of 4 strings), and "correctAnswer" (the correct option string). Output only the raw JSON.`;

            try {
                const responseText = await getGeminiResponse(prompt);
                questions = JSON.parse(responseText);
                startGame();
            } catch (error) {
                console.error('Error starting game:', error);
                alert('Failed to generate quiz. Please check your API key and try again.');
                showScreen('setup');
            }
        });
        
        function startGame() {
            currentQuestionIndex = 0;
            score = 0;
            showScreen('game');
            displayQuestion();
        }

        function displayQuestion() {
            const question = questions[currentQuestionIndex];
            if (!question) {
                showScore();
                return;
            }

            scoreEl.textContent = score;
            questionTextEl.textContent = question.question;
            optionsContainer.innerHTML = '';
            feedbackArea.textContent = '';
            nextQuestionBtn.classList.add('hidden');

            // Shuffle options
            const shuffledOptions = shuffleArray([...question.options]);

            shuffledOptions.forEach(optionText => {
                const optionBtn = document.createElement('button');
                optionBtn.textContent = optionText;
                optionBtn.className = 'option-btn w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-left';
                optionBtn.onclick = () => selectAnswer(optionBtn, optionText);
                optionsContainer.appendChild(optionBtn);
            });
        }

        function selectAnswer(selectedBtn, selectedOption) {
            const question = questions[currentQuestionIndex];
            const isCorrect = selectedOption === question.correctAnswer;
            
            // Disable all options
            document.querySelectorAll('.option-btn').forEach(btn => btn.disabled = true);

            if (isCorrect) {
                score++;
                selectedBtn.classList.remove('bg-gray-50', 'dark:bg-gray-700', 'hover:bg-gray-200', 'dark:hover:bg-gray-600');
                selectedBtn.classList.add('bg-green-500', 'text-white');
                feedbackArea.textContent = 'Correct!';
                feedbackArea.classList.remove('text-red-500');
                feedbackArea.classList.add('text-green-500');
            } else {
                selectedBtn.classList.remove('bg-gray-50', 'dark:bg-gray-700', 'hover:bg-gray-200', 'dark:hover:bg-gray-600');
                selectedBtn.classList.add('bg-red-500', 'text-white');
                feedbackArea.textContent = `Incorrect! The correct answer was: ${question.correctAnswer}`;
                feedbackArea.classList.remove('text-green-500');
                feedbackArea.classList.add('text-red-500');
                
                // Highlight the correct answer
                document.querySelectorAll('.option-btn').forEach(btn => {
                    if (btn.textContent === question.correctAnswer) {
                        btn.classList.add('border-green-500', 'border-2');
                    }
                });
            }
            nextQuestionBtn.classList.remove('hidden');
        }

        nextQuestionBtn.addEventListener('click', () => {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                displayQuestion();
            } else {
                showScore();
            }
        });

        function showScore() {
            studentNameEl.textContent = studentName;
            correctAnswersEl.textContent = score;
            totalQuestionsEl.textContent = questions.length;
            const percentage = (score / questions.length) * 100;
            finalPercentageEl.textContent = `${percentage.toFixed(0)}%`;
            showScreen('score');
        }

        playAgainBtn.addEventListener('click', () => {
            showScreen('setup');
        });

        // --- Chatbot Logic ---
        chatbotToggleBtn.addEventListener('click', () => {
            const isHidden = chatbotWindow.classList.contains('hidden');
            if (isHidden) {
                chatbotWindow.classList.remove('hidden');
                setTimeout(() => {
                    chatbotWindow.classList.remove('opacity-0', 'scale-95');
                }, 10);
            } else {
                chatbotWindow.classList.add('opacity-0', 'scale-95');
                setTimeout(() => {
                    chatbotWindow.classList.add('hidden');
                }, 300);
            }
        });

        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userMessage = chatInput.value.trim();
            if (!userMessage) return;

            addChatMessage(userMessage, 'user');
            chatInput.value = '';
            chatSendBtn.disabled = true;

            const chatbotPrompt = `You are a helpful academic advisor for engineering students. Answer the following question concisely: "${userMessage}"`;
            
            try {
                const botResponse = await getGeminiResponse(chatbotPrompt);
                addChatMessage(botResponse, 'bot');
            } catch (error) {
                console.error('Chatbot error:', error);
                alert("Sorry, I couldn't get a response. Please check your API key.");
            } finally {
                chatSendBtn.disabled = false;
            }
        });

        function addChatMessage(message, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `p-2 rounded-lg mb-2 max-w-[85%] text-sm ${
                sender === 'user'
                    ? 'bg-blue-500 text-white self-end ml-auto'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 self-start'
            }`;
            messageDiv.textContent = message;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // --- Gemini API Call (reused for both features) ---
        async function getGeminiResponse(prompt) {
            const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${"AIzaSyAuO-Qlq0fUmmJ2UpOoKLu4HhWKiGSNxvQ"}`;
            const payload = { contents: [{ parts: [{ text: prompt }] }] };
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(`API request failed: ${errorBody.error.message}`);
            }
            const result = await response.json();
            if (result.candidates && result.candidates[0].content.parts[0].text) {
                let rawText = result.candidates[0].content.parts[0].text;
                rawText = rawText.replace(/^```json\s*/, '').replace(/```$/, '');
                return rawText;
            } else {
                throw new Error("Invalid response structure from Gemini API.");
            }
        }
        
        // --- Utility Functions ---
        function showScreen(screenName) {
            const allScreens = document.querySelectorAll('#setup-screen, #loading-screen, #game-screen, #score-screen');
            allScreens.forEach(screen => screen.classList.add('hidden'));
            document.getElementById(`${screenName}-screen`).classList.remove('hidden');
        }

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }