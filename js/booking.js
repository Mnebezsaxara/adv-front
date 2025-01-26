// Изначально скрываем элементы управления, таблицу и пагинацию
document.getElementById("controls").style.display = "none";
document.getElementById("bookings-list").style.display = "none";
document.getElementById("pagination").style.display = "none";

// Создание бронирования
// Создание бронирования
document.getElementById("booking-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;
    const field = document.getElementById("field").value;

    try {
        const response = await fetch("https://adv-server.onrender.com/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date, time, field })
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message);

            // Скрываем кнопки сортировки и пагинации
            document.getElementById("controls").style.display = "none";
            document.getElementById("pagination").style.display = "none";
            document.getElementById("bookings-list").style.display = "none";
        } else {
            alert(`Ошибка: ${data.message}`);
        }
    } catch (error) {
        console.error("Ошибка при создании бронирования:", error);
        alert("Ошибка при создании бронирования.");
    }
});


// Получение бронирований с параметрами (сортировка, фильтрация, пагинация)
async function fetchBookings(page = 1, sort = '', filter = '') {
    const url = new URL("https://adv-server.onrender.com/bookings");
    url.searchParams.append("page", page);
    if (sort) url.searchParams.append("sort", sort);
    if (filter) url.searchParams.append("filter", filter);

    try {
        const response = await fetch(url, { method: "GET" });
        const bookings = await response.json();

        console.log("Ответ сервера:", bookings); // Лог для проверки ответа сервера

        if (response.ok) {
            renderBookingsTable(bookings.data || bookings); // Отобразить таблицу с бронированиями
            renderPagination(bookings.totalPages || 1, page, sort, filter); // Отобразить пагинацию
        } else {
            alert("Ошибка при получении бронирований.");
        }
    } catch (error) {
        console.error("Ошибка при получении бронирований:", error);
        alert("Ошибка при загрузке бронирований.");
    }
}

// Отображение бронирований в виде таблицы
function renderBookingsTable(bookings) {
    if (!Array.isArray(bookings) || bookings.length === 0) {
        document.getElementById("bookings-list").innerHTML = "<p>Нет данных для отображения.</p>";
        return;
    }

    const table = `
        <table>
            <thead>
                <tr>
                    <th>Дата</th>
                    <th>Время</th>
                    <th>Поле</th>
                </tr>
            </thead>
            <tbody>
                ${bookings.map(booking => `
                    <tr>
                        <td>${booking.Date}</td>
                        <td>${booking.Time}</td>
                        <td>${booking.Field}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    document.getElementById("bookings-list").innerHTML = table;

    // Показываем кнопки сортировки, фильтрации и пагинацию
    document.getElementById("controls").style.display = "block";
    document.getElementById("pagination").style.display = "block";
}

// Кнопка "Посмотреть бронирования"
document.getElementById("view-bookings").addEventListener("click", () => {
    // Показать элементы управления, таблицу и пагинацию
    document.getElementById("bookings-list").style.display = "block";

    // Загрузить бронирования
    fetchBookings();
});

// Кнопка "Обновить бронирование"
document.getElementById("update-booking").addEventListener("click", async () => {
    const id = prompt("Введите ID бронирования для обновления:");
    const date = prompt("Введите новую дату (YYYY-MM-DD):");
    const time = prompt("Введите новое время (HH:MM):");
    const field = prompt("Введите новое поле (Поле Бекет Батыра / Поле Орынбаева):");

    if (id && date && time && field) {
        try {
            const response = await fetch("https://adv-server.onrender.com/bookings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ID: parseInt(id), Date: date, Time: time, Field: field })
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                fetchBookings(); // Обновляем список бронирований
            } else {
                alert(`Ошибка: ${data.message}`);
            }
        } catch (error) {
            console.error("Ошибка при обновлении бронирования:", error);
            alert("Не удалось обновить бронирование.");
        }
    } else {
        alert("Все поля должны быть заполнены.");
    }
});

// Кнопка "Удалить бронирование"
document.getElementById("delete-booking").addEventListener("click", async () => {
    const id = prompt("Введите ID бронирования для удаления:");

    if (id) {
        try {
            const response = await fetch("https://adv-server.onrender.com/bookings", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ID: parseInt(id) })
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                fetchBookings(); // Обновляем список бронирований
            } else {
                alert(`Ошибка: ${data.message}`);
            }
        } catch (error) {
            console.error("Ошибка при удалении бронирования:", error);
            alert("Не удалось удалить бронирование.");
        }
    } else {
        alert("ID бронирования должен быть указан.");
    }
});

// Сортировка
document.getElementById("sort-date").addEventListener("click", () => {
    const filter = document.getElementById("filter-field").value;
    fetchBookings(1, 'date', filter);
});
document.getElementById("sort-time").addEventListener("click", () => {
    const filter = document.getElementById("filter-field").value;
    fetchBookings(1, 'time', filter);
});

// Фильтрация
document.getElementById("filter-field").addEventListener("change", (event) => {
    fetchBookings(1, '', event.target.value);
});

// Пагинация
function renderPagination(totalPages, currentPage, sort, filter) {
    if (totalPages <= 1) {
        document.getElementById("pagination").innerHTML = '';
        return;
    }

    const buttons = Array.from({ length: totalPages }, (_, i) => {
        const page = i + 1;
        return `
            <button class="${page === currentPage ? 'active' : ''}" onclick="fetchBookings(${page}, '${sort}', '${filter}')">
                ${page}
            </button>
        `;
    }).join('');

    document.getElementById("pagination").innerHTML = buttons;
}
