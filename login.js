document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    
    // Правильные пароли
    const correctPasswords = ['21.10.25', '01.11.25'];
    
    // Проверка, уже авторизован ли пользователь
    if (localStorage.getItem('loggedIn')) {
        window.location.href = 'index.html';
    }
    
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const enteredPassword = passwordInput.value.trim();
        
        // Проверяем пароль
        if (correctPasswords.includes(enteredPassword)) {
            // Сохраняем статус авторизации
            localStorage.setItem('loggedIn', 'true');
            
            // Показываем успешный вход
            errorMessage.style.display = 'none';
            passwordInput.style.borderColor = '#4CAF50';
            passwordInput.style.boxShadow = '0 0 0 4px rgba(76, 175, 80, 0.1)';
            
            // Меняем текст кнопки
            const submitBtn = loginForm.querySelector('.login-button');
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Успешно!';
            submitBtn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
            
            // Перенаправляем через 1 секунду
            setTimeout(function() {
                window.location.href = 'index.html';
            }, 1000);
            
        } else {
            // Неверный пароль
            errorMessage.style.display = 'block';
            passwordInput.style.borderColor = '#ff4444';
            passwordInput.style.boxShadow = '0 0 0 4px rgba(255, 68, 68, 0.1)';
            
            // Анимация тряски
            loginForm.classList.add('shake');
            setTimeout(function() {
                loginForm.classList.remove('shake');
            }, 500);
            
            // Очищаем поле
            passwordInput.value = '';
            passwordInput.focus();
        }
    });
    
    // Очистка ошибки при новом вводе
    passwordInput.addEventListener('input', function() {
        if (errorMessage.style.display === 'block') {
            errorMessage.style.display = 'none';
            passwordInput.style.borderColor = '#e0e0e0';
            passwordInput.style.boxShadow = 'none';
        }
    });
    
    // Подсказка при долгом нажатии на сердце
    document.querySelector('.big-heart').addEventListener('contextmenu', function(event) {
        event.preventDefault();
        alert('💡 Подсказка: попробуй ввести наши важные даты (формат: ДД.ММ.ГГ)');
        return false;
    });
});