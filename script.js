const todoInput = document.getElementById('todoInput');
const hourInput = document.getElementById('hourInput');
const minuteInput = document.getElementById('minuteInput');
const secondInput = document.getElementById('secondInput');
const todoList = document.getElementById('todoList');
const emptyMessage = document.getElementById('emptyMessage');
const alarmSound = document.getElementById('alarmSound');

let todos = JSON.parse(localStorage.getItem('todos')) || [];
let timers = {};

function formatTime(totalSeconds) {
    if (totalSeconds <= 0) return "Time's up!";
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function addTodo() {
    const text = todoInput.value.trim();
    const hours = parseInt(hourInput.value) || 0;
    const minutes = parseInt(minuteInput.value) || 0;
    const seconds = parseInt(secondInput.value) || 0;

    if (!text) {
        alert('Please enter a task');
        return;
    }

    if (hours === 0 && minutes === 0 && seconds === 0) {
        alert('Please enter a time duration');
        return;
    }

    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    
    todos.push({
        text,
        completed: false,
        duration: totalSeconds,
        startTime: Date.now()
    });

    localStorage.setItem('todos', JSON.stringify(todos));
    
    // Clear inputs
    todoInput.value = '';
    hourInput.value = '';
    minuteInput.value = '';
    secondInput.value = '';

    renderTodos();
}

function updateTimer(index, startTime, duration) {
    const timerDisplay = document.getElementById(`timer-${index}`);
    if (!timerDisplay) return;

    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const remainingSeconds = duration - elapsedSeconds;

    if (remainingSeconds <= 0) {
        timerDisplay.textContent = "Time's up!";
        timerDisplay.classList.add('timer-expired');
        clearInterval(timers[index]);
        
        // Play alarm sound
        alarmSound.currentTime = 0; // Reset sound to start
        alarmSound.play().catch(error => {
            console.log("Audio playback failed:", error);
        });
        
        return;
    }

    timerDisplay.textContent = formatTime(remainingSeconds);
}

function toggleTodo(index) {
    todos[index].completed = !todos[index].completed;
    localStorage.setItem('todos', JSON.stringify(todos));
    renderTodos();
}

function deleteTodo(index) {
    clearInterval(timers[index]);
    stopAlarm();
    todos.splice(index, 1);
    localStorage.setItem('todos', JSON.stringify(todos));
    renderTodos();
}

function renderTodos() {
    todoList.innerHTML = '';
    emptyMessage.style.display = todos.length ? 'none' : 'block';

    // Clear existing timers
    Object.values(timers).forEach(timer => clearInterval(timer));
    timers = {};

    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                onchange="toggleTodo(${index})">
            <span class="todo-text">${todo.text}</span>
            <span id="timer-${index}" class="timer-display"></span>
            <button class="delete-btn" onclick="deleteTodo(${index})">Delete</button>
        `;
        
        todoList.appendChild(li);

        updateTimer(index, todo.startTime, todo.duration);
        timers[index] = setInterval(() => {
            updateTimer(index, todo.startTime, todo.duration);
        }, 1000);
    });
}

// Input validation
function validateTimeInput(input, max) {
    input.addEventListener('input', function() {
        let value = parseInt(this.value);
        if (isNaN(value) || value < 0) {
            this.value = '';
        } else if (value > max) {
            this.value = max;
        }
    });
}

validateTimeInput(hourInput, 23);
validateTimeInput(minuteInput, 59);
validateTimeInput(secondInput, 59);

// Enter key navigation
hourInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') minuteInput.focus();
});

minuteInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') secondInput.focus();
});

secondInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') hourInput.focus();
});

// Add function to stop alarm
function stopAlarm() {
    alarmSound.pause();
    alarmSound.currentTime = 0;
}

// Initial render
renderTodos(); 