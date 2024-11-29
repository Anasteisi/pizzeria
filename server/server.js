const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5500;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Массив для хранения заказов
let orders = [];
let orderCounter = 1;

// Обработчик POST-запроса для создания нового заказа
app.post('/api/orders', (req, res) => {
    const orderData = req.body;

    // Добавляем номер заказа
    orderData.orderNumber = orderCounter++;
    
    // Сохраняем заказ в массиве
    orders.push(orderData);

    console.log('Получен новый заказ:', orderData);
    res.status(201).json({ message: 'Заказ успешно создан', order: orderData });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
