document.addEventListener("DOMContentLoaded", () => {
    // --- ДИНАМИЧЕСКАЯ ЗАГРУЗКА ДАННЫХ ИЗ GOOGLE SHEETS (ИСПРАВЛЕНА) ---
    function updateFinanceDataFromSheet() {
        const sheetId = '1Y3cPgxJ4XI1WbDsRA0M1YdGCql8qxfgkpi6lnLAkatI';
        // ИСПРАВЛЕНО: имя листа теперь "итог" (в единственном числе)
        const sheetName = 'итог'; 
        const range = 'A2:B2';
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}&range=${range}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok. Проверьте, опубликована ли таблица (Файл -> Поделиться -> Опубликовать в интернете).');
                }
                return response.text();
            })
            .then(csvText => {
                // Проверяем, не пустой ли ответ
                if (!csvText || csvText.trim() === '') {
                     throw new Error('Получен пустой ответ от Google Sheets. Проверьте правильность имени листа и диапазона.');
                }

                const row = csvText.trim().replace(/"/g, '').split(',');
                
                const goal = parseFloat(row[0]);
                const collected = parseFloat(row[1]);

                if (isNaN(goal) || isNaN(collected)) {
                    console.error("Не удалось прочитать или преобразовать данные из таблицы. Полученные значения:", row);
                    return;
                }

                const remaining = goal - collected;
                const progressPercentage = (collected / goal) * 100;

                const collectedEl = document.querySelector('.amount-collected');
                const goalEl = document.querySelector('.amount-goal');
                const remainingEl = document.querySelector('.remaining-text span');
                const progressBar = document.querySelector('.progress-bar');
                const progressText = document.querySelector('.progress-text');
                
                goalEl.innerText = `${goal.toFixed(1)} млрд $`;
                
                collectedEl.dataset.value = collected.toFixed(1);
                remainingEl.dataset.value = remaining.toFixed(1);
                
                animateCounter(collectedEl);
                animateCounter(remainingEl);

                progressBar.dataset.width = `${progressPercentage.toFixed(1)}%`;
                progressBar.style.width = progressBar.dataset.width;
                
                progressText.innerText = `Прогресс: ${progressPercentage.toFixed(1)}% от цели`;
            })
            .catch(error => {
                console.error("Ошибка при загрузке данных из Google Sheets:", error);
            });
    }

    // Вызываем функцию для обновления данных при загрузке страницы
    updateFinanceDataFromSheet();


    // --- ФУНКЦИЯ №1: МНОГОСЛОЙНЫЙ ПАРАЛЛАКС ---
    window.addEventListener('scroll', () => {
        requestAnimationFrame(() => {
            const scrollTop = window.scrollY;
            document.querySelectorAll('.parallax-layer').forEach(layer => {
                const speed = parseFloat(layer.dataset.speed);
                const yPos = scrollTop * speed;
                
                if (layer.classList.contains('venus-optimized')) {
                    layer.style.transform = `translate(-50%, calc(-50% + ${yPos}px))`;
                } else {
                    layer.style.transform = `translateY(${yPos}px)`;
                }
            });
        });
    });

    // --- ФУНКЦИЯ №2: АНИМАЦИИ ПРИ ПРОКРУТКЕ ---
    const animatedItems = document.querySelectorAll('.animated-item');
    const scrollObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                scrollObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    animatedItems.forEach(item => scrollObserver.observe(item));

    // --- ФУНКЦИЯ №3: АНИМИРОВАННЫЙ СЧЕТЧИК ---
    function animateCounter(element) {
        const target = parseFloat(element.dataset.value);
        if (isNaN(target)) return;
        let current = 0;
        const duration = 2000;
        const increment = target / (duration / 16);

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.innerText = `${current.toFixed(1)} млрд $`;
                requestAnimationFrame(updateCounter);
            } else {
                element.innerText = `${target.toFixed(1)} млрд $`;
            }
        };
        requestAnimationFrame(updateCounter);
    }

    // --- ФУНКЦИЯ №4: КРУГОВЫЕ ДИАГРАММЫ ---
    if (document.getElementById('fundingChart')) {
        const fundingCtx = document.getElementById('fundingChart').getContext('2d');
        new Chart(fundingCtx, {
            type: 'doughnut',
            data: {
                labels: ['Частные инвесторы', 'Государство', 'Краудфандинг'],
                datasets: [{ data: [45, 35, 20], backgroundColor: ['#FF6B35', '#4BC0C0', '#FFCD56'], borderWidth: 0 }]
            },
            options: { cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: '#CCCCCC', font: { family: 'Inter' } } } } }
        });

        const expensesCtx = document.getElementById('expensesChart').getContext('2d');
        new Chart(expensesCtx, {
            type: 'doughnut',
            data: {
                labels: ['Разработка', 'Запуск', 'Исследования', 'Персонал'],
                datasets: [{ data: [40, 30, 20, 10], backgroundColor: ['#FF6B35', '#9966FF', '#4BC0C0', '#FFCD56'], borderWidth: 0 }]
            },
            options: { cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: '#CCCCCC', font: { family: 'Inter' } } } } }
        });
    }
});

document.querySelector('.venus-gif').playbackRate = 0;