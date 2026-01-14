const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Имя файла для хранения данных
const DATA_FILE = 'data.json';

// Функция загрузки данных из файла
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
  }
  
  // Возвращаем начальные данные, если файла нет
  return {
    photos: [],
    moments: [],
    passwords: ['21.10.25', '01.11.25']
  };
}

// Функция сохранения данных в файл
function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Ошибка сохранения данных:', error);
  }
}

// Загружаем данные при запуске
let storage = loadData();

// Разрешаем CORS для всех запросов
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Парсим JSON
app.use(express.json({ limit: '10mb' }));

// Проверка пароля
app.post('/api/check-password', (req, res) => {
  const { password } = req.body;
  
  if (storage.passwords.includes(password)) {
    res.json({ success: true, message: 'Пароль верный' });
  } else {
    res.json({ success: false, message: 'Неверный пароль' });
  }
});

// Получить все фото
app.get('/api/photos', (req, res) => {
  res.json({ photos: storage.photos });
});

// Добавить фото
app.post('/api/photos', (req, res) => {
  const { photoData } = req.body;
  
  if (!photoData) {
    return res.status(400).json({ error: 'Нет данных фото' });
  }
  
  const photo = {
    id: Date.now().toString(),
    data: photoData,
    date: new Date().toISOString()
  };
  
  storage.photos.unshift(photo);
  saveData(storage); // Сохраняем в файл
  res.json({ success: true, photo });
});

// Удалить фото
app.delete('/api/photos/:id', (req, res) => {
  const { id } = req.params;
  storage.photos = storage.photos.filter(photo => photo.id !== id);
  saveData(storage); // Сохраняем в файл
  res.json({ success: true });
});

// Получить все моменты
app.get('/api/moments', (req, res) => {
  res.json({ moments: storage.moments });
});

// Добавить момент
app.post('/api/moments', (req, res) => {
  const { title, text } = req.body;
  
  if (!title || !text) {
    return res.status(400).json({ error: 'Заполни все поля' });
  }
  
  const moment = {
    id: Date.now().toString(),
    title,
    text,
    date: new Date().toISOString()
  };
  
  storage.moments.unshift(moment);
  saveData(storage); // Сохраняем в файл
  res.json({ success: true, moment });
});

// Удалить момент
app.delete('/api/moments/:id', (req, res) => {
  const { id } = req.params;
  storage.moments = storage.moments.filter(moment => moment.id !== id);
  saveData(storage); // Сохраняем в файл
  res.json({ success: true });
});

// Получить статистику (количество фото и моментов)
app.get('/api/stats', (req, res) => {
  res.json({
    photos: storage.photos.length,
    moments: storage.moments.length
  });
});

// Очистить все данные (ОПАСНО!)
app.delete('/api/clear-all', (req, res) => {
  storage.photos = [];
  storage.moments = [];
  saveData(storage);
  res.json({ success: true, message: 'Все данные очищены' });
});

// Панель администратора (для управления данными)
app.get('/admin', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Админ-панель | Наш Мир</title>
      <style>
        body { 
          font-family: Arial; 
          padding: 20px; 
          background: #f5f5f5;
        }
        .container { 
          max-width: 800px; 
          margin: 0 auto; 
          background: white; 
          padding: 30px; 
          border-radius: 10px; 
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h1 { color: #ff4d6d; }
        .stats { 
          background: #e3f2fd; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0;
        }
        .danger-zone { 
          background: #ffebee; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0;
          border: 2px solid #ff4444;
        }
        button { 
          padding: 10px 20px; 
          border: none; 
          border-radius: 5px; 
          cursor: pointer; 
          margin: 5px;
        }
        .btn-primary { 
          background: #2196F3; 
          color: white; 
        }
        .btn-danger { 
          background: #f44336; 
          color: white; 
        }
        .btn-success { 
          background: #4CAF50; 
          color: white; 
        }
        .photo-item { 
          display: inline-block; 
          margin: 10px; 
          text-align: center;
        }
        .photo-item img { 
          width: 100px; 
          height: 100px; 
          object-fit: cover;
          border-radius: 8px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Админ-панель сервера "Наш Мир"</h1>
        
        <div class="stats">
          <h3>📊 Статистика</h3>
          <p><strong>Фотографий:</strong> <span id="photo-count">${storage.photos.length}</span></p>
          <p><strong>Моментов:</strong> <span id="moment-count">${storage.moments.length}</span></p>
          <p><strong>Размер файла данных:</strong> <span id="file-size">Загрузка...</span></p>
        </div>
        
        <div>
          <h3>🖼️ Фотографии</h3>
          <div id="photos-list">
            ${storage.photos.map(photo => `
              <div class="photo-item">
                <img src="${photo.data}" alt="Фото">
                <p>${new Date(photo.date).toLocaleDateString()}</p>
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="danger-zone">
          <h3 style="color: #f44336;">⚠️ Опасная зона</h3>
          <p>Эти действия нельзя отменить!</p>
          <button class="btn-danger" onclick="clearAllData()">🗑️ Очистить все данные</button>
          <button class="btn-danger" onclick="deleteAllPhotos()">❌ Удалить все фото</button>
          <button class="btn-danger" onclick="deleteAllMoments()">📝 Удалить все моменты</button>
        </div>
        
        <div>
          <button class="btn-primary" onclick="refreshStats()">🔄 Обновить статистику</button>
          <button class="btn-success" onclick="location.reload()">🔄 Обновить страницу</button>
          <button class="btn-primary" onclick="window.location.href='/'">🏠 На главную сервера</button>
        </div>
      </div>
      
      <script>
        // Функция для получения размера файла
        async function getFileSize() {
          try {
            const response = await fetch('/api/stats');
            const stats = await response.json();
            document.getElementById('photo-count').textContent = stats.photos;
            document.getElementById('moment-count').textContent = stats.moments;
            
            // Примерный размер файла (оценка)
            const estimatedSize = (stats.photos * 100 + stats.moments * 50) / 1024;
            document.getElementById('file-size').textContent = estimatedSize.toFixed(2) + ' KB';
          } catch (error) {
            console.error(error);
          }
        }
        
        // Функция очистки всех данных
        async function clearAllData() {
          if (!confirm('ВНИМАНИЕ! Вы действительно хотите удалить ВСЕ данные (фото и моменты)? Это действие нельзя отменить!')) {
            return;
          }
          
          try {
            const response = await fetch('/api/clear-all', { method: 'DELETE' });
            const result = await response.json();
            alert(result.message);
            location.reload();
          } catch (error) {
            alert('Ошибка: ' + error.message);
          }
        }
        
        // Функция удаления всех фото
        async function deleteAllPhotos() {
          if (!confirm('Удалить все фотографии?')) {
            return;
          }
          
          // Получаем все фото и удаляем по одной
          try {
            const response = await fetch('/api/photos');
            const data = await response.json();
            
            let deletedCount = 0;
            for (const photo of data.photos) {
              await fetch('/api/photos/' + photo.id, { method: 'DELETE' });
              deletedCount++;
            }
            
            alert('Удалено фотографий: ' + deletedCount);
            location.reload();
          } catch (error) {
            alert('Ошибка: ' + error.message);
          }
        }
        
        // Функция удаления всех моментов
        async function deleteAllMoments() {
          if (!confirm('Удалить все моменты?')) {
            return;
          }
          
          try {
            const response = await fetch('/api/moments');
            const data = await response.json();
            
            let deletedCount = 0;
            for (const moment of data.moments) {
              await fetch('/api/moments/' + moment.id, { method: 'DELETE' });
              deletedCount++;
            }
            
            alert('Удалено моментов: ' + deletedCount);
            location.reload();
          } catch (error) {
            alert('Ошибка: ' + error.message);
          }
        }
        
        // Функция обновления статистики
        function refreshStats() {
          getFileSize();
        }
        
        // Загружаем размер файла при открытии страницы
        getFileSize();
      </script>
    </body>
    </html>
  `);
});

// Стартовая страница
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Наш Мир - Сервер</title>
      <style>
        body { 
          font-family: Arial; 
          text-align: center; 
          padding: 50px; 
          background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
        }
        .container { 
          background: white; 
          padding: 30px; 
          border-radius: 20px; 
          max-width: 500px; 
          margin: 0 auto; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        h1 { color: #ff4d6d; }
        .status { 
          background: #4CAF50; 
          color: white; 
          padding: 10px; 
          border-radius: 10px; 
          margin: 20px 0;
        }
        .btn { 
          display: inline-block; 
          padding: 10px 20px; 
          background: #2196F3; 
          color: white; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 5px;
        }
        .btn-danger { background: #f44336; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>❤️ Сервер "Наш Мир"</h1>
        <div class="status">✅ Сервер работает!</div>
        <p>Данные сохраняются в файл <code>data.json</code></p>
        
        <h3>📊 Статистика:</h3>
        <p>Фотографий: ${storage.photos.length}</p>
        <p>Моментов: ${storage.moments.length}</p>
        
        <h3>🔧 Управление:</h3>
        <a href="/admin" class="btn">📋 Админ-панель</a>
        
        <h3>📡 API эндпоинты:</h3>
        <ul style="text-align: left;">
          <li><code>GET /api/photos</code> - получить все фото</li>
          <li><code>POST /api/photos</code> - добавить фото</li>
          <li><code>DELETE /api/photos/:id</code> - удалить фото</li>
          <li><code>GET /api/moments</code> - получить все моменты</li>
          <li><code>POST /api/moments</code> - добавить момент</li>
          <li><code>DELETE /api/moments/:id</code> - удалить момент</li>
        </ul>
        
        <p><strong>URL сервера:</strong> http://localhost:${PORT}</p>
      </div>
    </body>
    </html>
  `);
});

// Запуск сервера
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('✅ Сервер запущен!');
  console.log('📡 Доступен по адресу: http://localhost:' + PORT);
  console.log('💾 Данные сохраняются в файл: ' + DATA_FILE);
  console.log('📋 Админ-панель: http://localhost:' + PORT + '/admin');
  console.log('='.repeat(50));
});