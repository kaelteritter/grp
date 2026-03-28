// frontend/js/core/healthcheck.js

export async function checkHealth() {
    const resultDiv = document.getElementById('healthResult');
    resultDiv.innerHTML = 'Проверка...'; 
    try {
        const response = await fetch('http://localhost:8000/health');
        const data = await response.json();
        resultDiv.innerHTML = `Статус: ${data.status}`;
    } catch (error) {
        resultDiv.innerHTML = `Ошибка подключения: ${error.message}`;
    }
}