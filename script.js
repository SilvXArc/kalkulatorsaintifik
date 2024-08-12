let variables = {}; // Objek untuk menyimpan variabel
let history = [];   // Array untuk menyimpan sejarah kalkulasi
let showFullHistory = false; // Status untuk menampilkan seluruh sejarah

function appendNumber(number) {
    document.getElementById('result').value += number;
}
function appendOperator(operator) {
    document.getElementById('result').value += operator;
}
function appendDot() {
    document.getElementById('result').value += '.';
}
function clearDisplay() {
    document.getElementById('result').value = '';
}
function deleteChar() {
    let display = document.getElementById('result');
    display.value = display.value.slice(0, -1);
}

// Menghitung hasil ekspresi di tampilan kalkulasi
function calculate() {
    let display = document.getElementById('result');
    let expression = display.value
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/%/g, '/100');

    try {
        // Menangani bilangan negatif dengan pangkat
        expression = expression.replace(/(-?\d+(\.\d+)?)\s*\^/g, '($1)**');
        expression = expression.replace(/\|(.+?)\|/g, 'Math.abs($1)');
        
        for (let variable in variables) {
            expression = expression.replace(new RegExp(`\\b${variable}\\b`, 'g'), variables[variable]);
        }
        
        let result = eval(expression);
        result = parseFloat(result.toFixed(3)); // Pembatasan angka desimal hingga 3 angka
        display.value = result;
        addToHistory(expression + ' => ' + result);
    } catch (e) {
        alert('Kesalahan dalam perhitungan');
    }
}


// Fungsi faktorial untuk digunakan dalam ekspresi
function factorial(n) {
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
}

// Mendeklarasikan variabel berdasarkan input pengguna
function declareVariable(event) {
    if (event.key === 'Enter') {
        const input = event.target.value;
        if (input.includes('=')) {
            const [left, right] = input.split('=').map(s => s.trim());
            if (left.includes('x')) {
                solveLinearEquation(left, right);
            } else {
                variables[left] = parseFloat(right);
                alert(`Variabel ${left} ditetapkan ke ${right}`);
            }
            event.target.value = '';
        } else {
            alert('Format variabel tidak valid. Gunakan format x=5 atau 9x=81');
        }
    }
}

// Menyelesaikan persamaan linear sederhana untuk variabel x
function solveLinearEquation(left, right) {
    const variable = 'x';
    const leftCoeff = parseFloat(left.replace(variable, '').trim()) || 1;
    const rightValue = parseFloat(right.trim());
    const result = parseFloat((rightValue / leftCoeff).toFixed(3)); // Pembatasan angka desimal hingga 3 angka
    variables[variable] = result;
    alert(`Hasil dari ${left} = ${right} adalah ${variable} = ${result}`);
    addToHistory(`${left} = ${right} => ${variable} = ${result}`);
}

// Menambahkan entri ke sejarah kalkulasi
function addToHistory(entry) {
    history.push(entry);
    displayHistory();
}

// Menampilkan sejarah kalkulasi, dengan opsi untuk melihat seluruh sejarah
function displayHistory() {
    let historyDiv = document.getElementById('history');
    let displayedHistory = showFullHistory ? history : history.slice(-3);
    historyDiv.innerHTML = displayedHistory.map(e => `<div>${e}</div>`).join('');
}

// Mengubah tampilan sejarah kalkulasi antara penuh atau tiga terbaru
function toggleHistoryView() {
    showFullHistory = !showFullHistory;
    displayHistory();
}

// Mengubah mode terang/gelap dari aplikasi
function toggleMode() {
    let body = document.body;
    if (document.getElementById('mode-switch').checked) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
    }
}

// Mengonversi nilai desimal ke format pecahan
function convertToFraction() {
    let display = document.getElementById('result');
    let value = parseFloat(display.value);
    if (!isNaN(value)) {
        let fraction = toFraction(value);
        display.value = fraction;
        addToHistory(`${value} => ${fraction}`);
    } else {
        alert('Nilai tidak valid untuk konversi ke pecahan');
    }
}

// Fungsi untuk mengonversi desimal ke pecahan
function toFraction(decimal) {
    let tolerance = 1.0E-6;
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1, b = decimal;
    do {
        let a = Math.floor(b);
        let aux = h1; h1 = a * h1 + h2; h2 = aux;
        aux = k1; k1 = a * k1 + k2; k2 = aux;
        b = 1 / (b - a);
    } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);

    return `${h1}/${k1}`;
}

// Mengganti fungsi eval untuk mendukung fungsi tambahan
(function() {
    const originalEval = eval;
    window.eval = function(code) {
        return originalEval(code
            .replace(/factorial\((\d+)\)/g, (match, n) => factorial(Number(n)))
            .replace(/Math.sin\(([^)]+)\)/g, (match, angle) => `Math.sin(${angle} * Math.PI / 180)`)
            .replace(/Math.cos\(([^)]+)\)/g, (match, angle) => `Math.cos(${angle} * Math.PI / 180)`)
            .replace(/Math.tan\(([^)]+)\)/g, (match, angle) => `Math.tan(${angle} * Math.PI / 180)`)
            .replace(/Math.sqrt\(([^)]+)\)/g, (match, value) => `Math.sqrt(${value})`)
        );
    };
})();
