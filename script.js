window.onload = () => {
    populateDateSelect();
    updateOrderCounter(); // Инициализируем счётчик заказов
};

let cart = {};
//let orderCount = 0; // Счётчик заказов
let currentOrderNumber = 1; // Номер текущего заказа

// Выбор даты и времени
document.addEventListener("DOMContentLoaded", function () {
    // Заполняем поле времени
    function populateTimeOptions() {
        const timeSelect = document.getElementById('time-select');
        timeSelect.innerHTML = ''; // Очищаем предыдущие значения
        timeSelect.innerHTML += '<option value="" disabled selected>Выберите время</option>';
    
        const today = moment(); // Текущее время
        const selectedDate = document.getElementById('date-select').value; // Получаем выбранную дату
    
        // Если выбрана дата "Сегодня"
        if (selectedDate === 'today') {
            // Устанавливаем минимальное время (текущее время + 30 минут)
            const minTime = today.clone().add(30, 'minutes');
            
            // Генерируем временные опции начиная с минимального времени
            let startHour = minTime.hour();
            let startMinute = Math.ceil(minTime.minute() / 30) * 30; // Округляем до ближайшего получаса
    
            // Если минут округлены до 60, переходим на следующий час
            if (startMinute === 60) {
                startHour++;
                startMinute = 0;
            }
    
            for (let hour = startHour; hour <= 22; hour++) {
                for (let minute = startMinute; minute < 60; minute += 30) {
                    const time = moment().hour(hour).minute(minute).format('HH:mm');
                    timeSelect.innerHTML += `<option value="${time}">${time}</option>`;
                }
                startMinute = 0; // После первого часа устанавливаем минуты в 0
            }
        } else {
            // Если выбрана дата не "Сегодня", добавляем все временные опции
            for (let hour = 10; hour <= 22; hour++) {
                for (let minute = 0; minute < 60; minute += 30) {
                    const time = moment().hour(hour).minute(minute).format('HH:mm');
                    timeSelect.innerHTML += `<option value="${time}">${time}</option>`;
                }
            }
        }
    }
    
    // Заполняем время при загрузке страницы
    populateTimeOptions();

    // Обработчик для выбора даты
    document.getElementById('date-select').addEventListener('change', function () {
        const selectedValue = this.value;
        const today = moment();
        let selectedDate;
    
        if (selectedValue === 'today') {
            selectedDate = today.format('YYYY-MM-DD');
        } else if (selectedValue === 'tomorrow') {
            selectedDate = today.add(1, 'days').format('YYYY-MM-DD');
        } else if (selectedValue === 'day-after-tomorrow') {
            selectedDate = today.add(2, 'days').format('YYYY-MM-DD');
        }
    
        console.log('Выбранная дата:', selectedDate); // Для проверки
        populateTimeOptions(); // Обновляем временные опции при изменении даты
    });    
});

function updateCart() {
    const cartList = document.getElementById('cart');
    cartList.innerHTML = ''; // Очистить текущий список
    for (const itemName in cart) {
        const item = cart[itemName];
        const li = document.createElement('li');
        li.textContent = `${itemName} - ${item.quantity} шт. - ${item.price * item.quantity} руб.`;
        cartList.appendChild(li);
    }
    document.getElementById('order-details-container').style.display = Object.keys(cart).length > 0 ? 'block' : 'none';
}

function addToCart(name, price) {
    if (cart[name]) {
        cart[name].quantity += 1;
    } else {
        cart[name] = {
            quantity: 1,
            price: price,
            name: name // Добавляем имя товара
        };
    }
    updateCartDisplay();
    showAddedToCartMessage(name); // Показываем сообщение о добавлении
}

function showAddedToCartMessage(name) {
    const message = document.createElement('div');
    message.textContent = `${name} теперь в корзине`;
    message.style.position = 'fixed';
    message.style.top = '20px';
    message.style.left = '50%';
    message.style.transform = 'translateX(-50%)';
    message.style.background = 'radial-gradient(circle at center, var(--color-green), var(--color-dark-green) 70%)';
    message.style.color = 'white';
    message.style.padding = '10px';
    message.style.borderRadius = '25px';
    message.style.zIndex = '1000';
    document.body.appendChild(message);

    setTimeout(() => {
        document.body.removeChild(message);
    }, 1000);
}

function updateCartDisplay() {
    const cartList = document.getElementById('cart');
    const toCartButton = document.querySelector('.to-cart');
    const customButton = document.querySelector('.custom-button');
    cartList.innerHTML = '';
    let totalOrderPrice = 0;

    if (Object.keys(cart).length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.textContent = 'Корзина пуста';
        emptyMessage.className = 'empty-cart-message';
        emptyMessage.onclick = showModal;
        cartList.appendChild(emptyMessage);

        const orderDetailsContainer = document.getElementById('order-details-container');
        orderDetailsContainer.style.display = 'none';

        toCartButton.textContent = 'Корзина пуста';
        customButton.textContent = 'Корзина пуста';
        return;
    }

    for (const itemName in cart) {
        const item = cart[itemName];
        const totalItemPrice = item.quantity * item.price;

        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';

        const textContainer = document.createElement('div');
        textContainer.textContent = `${itemName}, ${item.quantity} шт., ${totalItemPrice} ₽`;
        textContainer.style.flex = '1';

        const decreaseButton = document.createElement('button');
        decreaseButton.className = 'decrease-button';
        decreaseButton.textContent = '-';
        decreaseButton.onclick = () => decreaseQuantity(itemName);
        decreaseButton.style.marginLeft = '10px';

        const increaseButton = document.createElement('button');
        increaseButton.className = 'increase-button';
        increaseButton.textContent = '+';
        increaseButton.onclick = () => addToCart(itemName, item.price);
        increaseButton.style.marginLeft = '10px';

        li.appendChild(textContainer);
        li.appendChild(increaseButton);
        li.appendChild(decreaseButton);
        cartList.appendChild(li);

        totalOrderPrice += totalItemPrice;
    }

    const totalLi = document.createElement('li');
    totalLi.textContent = `Итого: ${totalOrderPrice} ₽`;
    totalLi.className = 'total-price';
    totalLi.style.display = 'flex';
    totalLi.style.justifyContent = 'flex-end';
    cartList.appendChild(totalLi);

    const clearCartButtonContainer = document.createElement('li');
    clearCartButtonContainer.style.display = 'flex';
    clearCartButtonContainer.style.justifyContent = 'center';

    const clearCartButton = document.createElement('button');
    clearCartButton.className = 'clear-cart';
    clearCartButton.textContent = 'Очистить корзину';
    clearCartButton.onclick = clearCart;

    clearCartButtonContainer.appendChild(clearCartButton);
    cartList.appendChild(clearCartButtonContainer);

    const orderDetailsContainer = document.getElementById('order-details-container');
    orderDetailsContainer.style.display = 'block';

    toCartButton.textContent = 'Перейти в корзину';
    toCartButton.disabled = false;
    customButton.textContent = 'Перейти в корзину';
    customButton.disabled = false;
}

function showModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'block';
}

function placeOrder() {
    const pickupDate = document.getElementById('date-select').value;
    const pickupTime = document.getElementById('time-select').value;
    const customerName = document.getElementById('customer-name').value;
    const customerPhone = document.getElementById('customer-phone').value;

    if (!customerName) {
        alert('Пожалуйста, укажите имя.');
        return;
    }
    if (!customerPhone) {
        alert('Пожалуйста, укажите номер телефона.');
        return;
    }
    if (!pickupDate) {
        alert('Пожалуйста, выберите дату.');
        return;
    }
    if (!pickupTime) {
        alert('Пожалуйста, выберите время.');
        return;
    }

    const cartItems = getCartItems();
    if (cartItems.length === 0) {
        alert('Корзина пуста. Пожалуйста, добавьте товары перед оформлением заказа.');
        return;
    }

    sendOrder(cartItems, pickupDate, pickupTime, customerName, customerPhone);
}

function getCartItems() {
    return Object.values(cart).map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
    }));
}

function sendOrder(cartItems, pickupDate, pickupTime, customerName, customerPhone) {
    const orderData = {
        items: cartItems,
        total: cartItems.reduce((total, item) => total + (item.quantity * item.price), 0),
        date: pickupDate,
        time: pickupTime,
        customerName: customerName,
        customerPhone: customerPhone,
        orderNumber: currentOrderNumber
    };

    console.log('Отправка заказа:', orderData);

    /*fetch('http://localhost:5500/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Сеть ответила с ошибкой: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log('Успех:', data);
        clearCart();
        orderCount++;
        currentOrderNumber++;
        updateOrderCounter();
    })
    .catch((error) => {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при отправке заказа.');
    });*/

    fetch('http://localhost:5500/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(response => {
        // Проверяем статус ответа
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`Ошибка: ${response.status} - ${text}`);
            });
        }
        // Возвращаем JSON, если ответ успешный
        return response.json();
    })
    .then(data => {
        console.log('Успех:', data);
        alert('Спасибо! Номер вашего заказа: ' + currentOrderNumber);
        clearCart();
        //orderCount++;
        currentOrderNumber++; // Увеличиваем номер текущего заказа
        updateOrderCounter();
        closeModal();
    })
    
    .catch((error) => {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при отправке заказа: ' + error.message);
    });
    
}

function decreaseQuantity(name) {
    if (cart[name]) {
        cart[name].quantity -= 1;
        if (cart[name].quantity <= 0) {
            removeFromCart(name);
        } else {
            updateCartDisplay();
        }
    }
}

function removeFromCart(name) {
    delete cart[name];
    updateCartDisplay();
}

function clearCart() {
    cart = {};
    updateCartDisplay();
}

function closeModal() {
    $('#cartModal').modal('hide'); // Используем метод Bootstrap для закрытия модального окна
}

function updateOrderCounter() {
    //document.getElementById('order-count').textContent = orderCount;
    document.getElementById('current-order-number').textContent = currentOrderNumber;
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartDisplay();
});

window.onscroll = function() {
    const buttonToCart = document.querySelector('.to-cart');
    const menuSection = document.getElementById('tocart');
    const menuBottom = menuSection.getBoundingClientRect().bottom;

    // Управление видимостью кнопки "Добавить в корзину"
    if (menuBottom < 0) {
        buttonToCart.classList.add('show'); // Показать кнопку
        buttonToCart.style.display = "block"; // Убедитесь, что кнопка отображается
    } else {
        buttonToCart.classList.remove('show'); // Скрыть кнопку
        buttonToCart.style.display = "none"; // Убедитесь, что кнопка скрыта
    }

    // Управление видимостью кнопки "Наверх"
    const buttonUp = document.querySelector('.up');
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        buttonUp.style.display = "block"; // Показать кнопку "Наверх"
    } else {
        buttonUp.style.display = "none"; // Скрыть кнопку "Наверх"
    }
};


function populateDateSelect() {
    const dateSelect = document.getElementById('date-select');
    dateSelect.innerHTML = ''; // Очищаем предыдущие значения
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };

    // Добавляем три даты
    const today = new Date();
    const todayOption = document.createElement('option');
    todayOption.value = 'today';
    todayOption.textContent = 'Сегодня';
    dateSelect.appendChild(todayOption);

    const tomorrowOption = document.createElement('option');
    tomorrowOption.value = 'tomorrow';
    tomorrowOption.textContent = 'Завтра';
    dateSelect.appendChild(tomorrowOption);

    const dayAfterTomorrowOption = document.createElement('option');
    dayAfterTomorrowOption.value = 'day-after-tomorrow';
    dayAfterTomorrowOption.textContent = 'Послезавтра';
    dateSelect.appendChild(dayAfterTomorrowOption);
}


function openCartModal() {
    if (Object.keys(cart).length === 0) {
        showModal();
    } else {
        $('#cartModal').modal('show');
    }
}

function handleCartButtonClick() {
    openCartModal();
}

document.getElementById('createOrderButton').addEventListener('click', () => {
    const orderData = {
        item: 'Пример товара',
        quantity: 2,
        price: 100
    };

    fetch('http://localhost:5500/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(response => {
        // Проверяем статус ответа
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`Ошибка: ${response.status} - ${text}`);
            });
        }
        // Возвращаем JSON, если ответ успешный
        return response.json();
    })
    .then(data => {
        console.log('Ответ от сервера:', data);
        if (data.error) {
            throw new Error(data.error);
        }
        console.log('Успех:', data);
        alert('Заказ успешно создан: ' + JSON.stringify(data.order));
    })
    .catch((error) => {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при отправке заказа: ' + error.message);
    });
});