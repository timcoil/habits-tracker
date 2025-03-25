// DOM Elements
const habitInput = document.getElementById('habit-input');
const addHabitBtn = document.getElementById('add-habit-btn');
const habitsList = document.getElementById('habits-list');

// Load habits from localStorage
let habits = JSON.parse(localStorage.getItem('habits')) || [];

// Initialize app
function init() {
    renderHabits();
    
    // Event listeners
    addHabitBtn.addEventListener('click', addHabit);
    habitInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addHabit();
        }
    });
}

// Render habits list
function renderHabits() {
    habitsList.innerHTML = '';
    
    if (habits.length === 0) {
        habitsList.innerHTML = '<li class="habit-item">No habits added yet. Add one above!</li>';
        return;
    }
    
    habits.forEach((habit, index) => {
        const li = document.createElement('li');
        li.className = 'habit-item';
        
        // Calculate streak
        const streakText = habit.streak > 0 ? `Streak: ${habit.streak} day${habit.streak !== 1 ? 's' : ''}` : '';
        
        li.innerHTML = `
            <span class="habit-name ${habit.completed ? 'completed' : ''}">${habit.name}</span>
            <span class="streak-count">${streakText}</span>
            <div class="habit-actions">
                <button class="complete-btn">${habit.completed ? 'Undo' : 'Complete'}</button>
                <button class="delete-btn">Delete</button>
            </div>
        `;
        
        // Complete button event
        li.querySelector('.complete-btn').addEventListener('click', () => toggleComplete(index));
        
        // Delete button event
        li.querySelector('.delete-btn').addEventListener('click', () => deleteHabit(index));
        
        habitsList.appendChild(li);
    });
}

// Add new habit
function addHabit() {
    const habitName = habitInput.value.trim();
    
    if (habitName) {
        const newHabit = {
            name: habitName,
            completed: false,
            streak: 0,
            lastCompleted: null
        };
        
        habits.push(newHabit);
        saveHabits();
        habitInput.value = '';
        renderHabits();
    }
}

// Toggle habit complete status
function toggleComplete(index) {
    const habit = habits[index];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (!habit.completed) {
        // Mark as completed
        habit.completed = true;
        
        // Update streak
        if (habit.lastCompleted) {
            const lastDate = new Date(habit.lastCompleted);
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            // Check if last completed was yesterday
            if (lastDate.toDateString() === yesterday.toDateString()) {
                habit.streak += 1;
            } else if (lastDate.toDateString() !== today.toDateString()) {
                habit.streak = 1; // Reset streak if not completed yesterday
            }
        } else {
            habit.streak = 1; // First completion
        }
        
        habit.lastCompleted = today.toISOString();
    } else {
        // Undo completion
        habit.completed = false;
        
        // If undoing today's completion, decrease streak
        if (habit.lastCompleted) {
            const lastDate = new Date(habit.lastCompleted);
            if (lastDate.toDateString() === today.toDateString()) {
                habit.streak = Math.max(0, habit.streak - 1);
                
                // Find previous completion date if streak is still > 0
                if (habit.streak > 0) {
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    habit.lastCompleted = yesterday.toISOString();
                } else {
                    habit.lastCompleted = null;
                }
            }
        }
    }
    
    saveHabits();
    renderHabits();
}

// Delete habit
function deleteHabit(index) {
    if (confirm('Are you sure you want to delete this habit?')) {
        habits.splice(index, 1);
        saveHabits();
        renderHabits();
    }
}

// Save habits to localStorage
function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

// Check for day change to reset completion status
function checkDayChange() {
    const now = new Date();
    const today = now.toDateString();
    const lastChecked = localStorage.getItem('lastChecked');
    
    if (lastChecked && lastChecked !== today) {
        // Reset completion status for all habits
        habits.forEach(habit => {
            habit.completed = false;
        });
        saveHabits();
        renderHabits();
    }
    
    localStorage.setItem('lastChecked', today);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    checkDayChange();
    
    // Check for day change when page becomes visible
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            checkDayChange();
        }
    });
}); 