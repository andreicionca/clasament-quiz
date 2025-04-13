// Variabile globale pentru datele tabloului și configurații
let tableData = [];
let numberOfRounds = 2;
let quizTitle = "Clasament Quiz";
let resultsChart = null;

// Referințe către elementele DOM - inițializate după ce DOM-ul este complet încărcat
let tableBody;
let tableHeader;
let quizTitleElement;
let editTitleBtn;
let addRowBtn;
let addRoundBtn;
let generateChartBtn;
let exportExcelBtn;
let chartCanvas;

// Funcție pentru inițializarea aplicației și încărcarea datelor la pornire
function initializeData() {
  // Verificăm dacă există date salvate, altfel inițializăm cu date implicite
  const savedData = localStorage.getItem("quizData");
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      if (parsedData.tableData) {
        tableData = parsedData.tableData;
      }
      if (parsedData.numberOfRounds) {
        numberOfRounds = parsedData.numberOfRounds;
      }
      if (parsedData.quizTitle) {
        quizTitle = parsedData.quizTitle;
      }
    } catch (e) {
      console.error("Eroare la parsarea datelor salvate:", e);
      initializeDefaultData();
    }
  } else {
    initializeDefaultData();
  }
}

// Inițializează datele implicite când nu există date salvate
function initializeDefaultData() {
  tableData = [
    { nume: "Echipa 1", puncteTotal: 0, runde: ["", ""] },
    { nume: "Echipa 2", puncteTotal: 0, runde: ["", ""] },
    { nume: "Echipa 3", puncteTotal: 0, runde: ["", ""] },
    { nume: "Echipa 4", puncteTotal: 0, runde: ["", ""] },
    { nume: "Echipa 5", puncteTotal: 0, runde: ["", ""] },
  ];
  numberOfRounds = 2;
  quizTitle = "Clasament Quiz";
}

// Funcție pentru inițializarea aplicației după încărcarea DOM-ului
document.addEventListener("DOMContentLoaded", function () {
  // Inițializăm referințele DOM
  tableBody = document.getElementById("tableBody");
  tableHeader = document.getElementById("tableHeader");
  quizTitleElement = document.getElementById("quizTitle");
  editTitleBtn = document.getElementById("editTitleBtn");
  addRowBtn = document.getElementById("addRowBtn");
  addRoundBtn = document.getElementById("addRoundBtn");
  generateChartBtn = document.getElementById("generateChartBtn");
  exportExcelBtn = document.getElementById("exportExcelBtn");
  chartCanvas = document.getElementById("resultsChart");

  // Ascundem containerul pentru grafic în pagina de configurare punctaje
  document.querySelector(".chart-container").style.display = "none";

  // Reorganizăm butoanele conform cerințelor
  reorganizeButtons();

  // Inițializăm datele
  initializeData();

  // Actualizăm titlul
  if (quizTitleElement) {
    quizTitleElement.textContent = quizTitle;
  }

  // Adăugăm event listeners
  if (editTitleBtn) editTitleBtn.addEventListener("click", editTitle);

  if (addRowBtn) {
    addRowBtn.addEventListener("click", () => {
      // Calculează următorul număr de echipă
      let nextTeamNumber = 1;
      const teamNumbers = tableData
        .map((row) => row.nume)
        .filter((nume) => nume.startsWith("Echipa "))
        .map((nume) => {
          const match = nume.match(/Echipa (\d+)/);
          return match ? parseInt(match[1]) : 0;
        });

      if (teamNumbers.length > 0) {
        nextTeamNumber = Math.max(...teamNumbers) + 1;
      }

      // Creează un nou rând cu runde goale și punctaj inițial 0
      const newRow = {
        nume: `Echipa ${nextTeamNumber}`,
        puncteTotal: 0,
        runde: Array(numberOfRounds).fill(""),
      };

      tableData.push(newRow);
      renderTable();
    });
  }

  if (addRoundBtn) addRoundBtn.addEventListener("click", addRound);
  if (generateChartBtn)
    generateChartBtn.addEventListener("click", generateChart);
  if (exportExcelBtn) exportExcelBtn.addEventListener("click", exportToExcel);

  // Salvăm datele automat când se încarcă aplicația
  saveData();

  // Inițializăm tabelul
  updateTableHeader();
  renderTable();

  // Adăugăm stiluri CSS pentru a elimina săgețile de la input number
  addCustomStyles();
});

// Funcție pentru a reorganiza butoanele conform cerințelor
function reorganizeButtons() {
  const controlsContainer = document.querySelector(".controls");
  const tableContainer = document.querySelector(".table-container");

  // Creăm un nou container pentru butoanele de sus (Adaugă Echipă și Adaugă Rundă)
  const topControls = document.createElement("div");
  topControls.className = "controls top-controls";

  // Creăm un nou container pentru butoanele de jos (Generează Grafic, Export)
  const bottomControls = document.createElement("div");
  bottomControls.className = "controls bottom-controls";

  // Mutăm butoanele în containerele corespunzătoare
  if (addRowBtn) topControls.appendChild(addRowBtn);
  if (addRoundBtn) topControls.appendChild(addRoundBtn);

  if (generateChartBtn) bottomControls.appendChild(generateChartBtn);
  if (exportExcelBtn) bottomControls.appendChild(exportExcelBtn);

  // Înlocuim vechiul container cu cele două noi
  controlsContainer.parentNode.insertBefore(topControls, controlsContainer);
  tableContainer.parentNode.insertBefore(
    bottomControls,
    tableContainer.nextSibling
  );

  // Eliminăm containerul original
  controlsContainer.remove();

  // Stilizăm butonul Generează Grafic pentru a fi mai evidențiat
  if (generateChartBtn) {
    generateChartBtn.className = "btn chart-btn primary-btn";
    generateChartBtn.style.fontSize = "1.1rem";
    generateChartBtn.style.padding = "14px 22px";
  }
}

// Adăugăm stiluri CSS pentru a elimina săgețile de la input number
function addCustomStyles() {
  const style = document.createElement("style");
  style.textContent = `
    /* Eliminăm săgețile pentru input number în toate browserele */
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { 
      -webkit-appearance: none; 
      margin: 0; 
    }
    input[type=number] {
      -moz-appearance: textfield;
    }
    
    /* Uniformizăm culorile butoanelor */
    .btn {
      background-color: #3a8ff7;
    }
    .btn:hover {
      background-color: #1a68d1;
    }
    
    /* Stilizare specială pentru butonul Generează Grafic */
    .primary-btn {
      background-color: #9b59b6;
      font-size: 1.1rem;
      padding: 14px 22px;
    }
    .primary-btn:hover {
      background-color: #8e44ad;
    }
    
    /* Stiluri pentru containerele de butoane */
    .top-controls {
      margin-bottom: 20px;
    }
    .bottom-controls {
      margin-top: 30px;
      margin-bottom: 30px;
    }
    
    /* Buton pentru ștergere încă necesită o culoare distinctă */
    .delete-row {
      background-color: #e74c3c;
    }
    .delete-row:hover {
      background-color: #c0392b;
    }
  `;
  document.head.appendChild(style);
}

// Funcție pentru a actualiza antetul tabelului
function updateTableHeader() {
  const headerRow = tableHeader.querySelector("tr");
  headerRow.innerHTML = ""; // Golește antetul

  // Adaugă coloanele de bază
  const thNume = document.createElement("th");
  thNume.textContent = "NUME";
  headerRow.appendChild(thNume);

  const thTotal = document.createElement("th");
  thTotal.textContent = "Puncte Total";
  headerRow.appendChild(thTotal);

  // Adaugă coloanele pentru runde
  for (let i = 0; i < numberOfRounds; i++) {
    const thRunda = document.createElement("th");
    thRunda.textContent = `Runda ${i + 1}`;
    headerRow.appendChild(thRunda);
  }

  // Adaugă coloana pentru acțiuni
  const thActions = document.createElement("th");
  thActions.textContent = "Acțiuni";
  headerRow.appendChild(thActions);
}

// Funcție pentru a încărca datele în tabel
function renderTable() {
  tableBody.innerHTML = "";

  // Nu mai sortăm datele - afișăm în ordinea în care sunt introduse
  tableData.forEach((row, index) => {
    const tr = document.createElement("tr");

    // Celulă pentru nume
    const tdNume = document.createElement("td");
    const inputNume = document.createElement("input");
    inputNume.type = "text";
    inputNume.value = row.nume;
    inputNume.addEventListener("change", (e) => {
      row.nume = e.target.value;
      saveData(); // Salvăm datele automat când se schimbă numele
    });
    tdNume.appendChild(inputNume);
    tr.appendChild(tdNume);

    // Celulă pentru puncte total (calculată automat)
    const tdTotal = document.createElement("td");
    tdTotal.textContent = row.puncteTotal;
    tr.appendChild(tdTotal);

    // Celule pentru fiecare rundă
    for (let i = 0; i < numberOfRounds; i++) {
      const tdRunda = document.createElement("td");
      const inputRunda = document.createElement("input");
      inputRunda.type = "number";
      inputRunda.min = "0";
      inputRunda.value = row.runde[i] || "";

      // Asigură-te că avem suficiente runde în array
      if (row.runde.length <= i) {
        row.runde.push("");
      }

      inputRunda.addEventListener("change", (e) => {
        row.runde[i] =
          e.target.value === "" ? "" : parseInt(e.target.value) || 0;
        updatePuncteTotal(index);
      });

      tdRunda.appendChild(inputRunda);
      tr.appendChild(tdRunda);
    }

    // Celulă pentru acțiuni (ștergere rând)
    const tdActions = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Șterge";
    deleteBtn.className = "delete-row";
    deleteBtn.addEventListener("click", () => {
      tableData.splice(index, 1);
      renderTable();
      saveData(); // Salvăm datele automat când se șterge un rând
    });
    tdActions.appendChild(deleteBtn);
    tr.appendChild(tdActions);

    // Adăugare rând la tabel
    tableBody.appendChild(tr);
  });
}

// Funcție pentru actualizarea punctajului total
function updatePuncteTotal(index) {
  const row = tableData[index];
  row.puncteTotal = row.runde.reduce((sum, score) => {
    // Convertește string-ul la număr sau folosește 0 dacă string-ul este gol
    const numScore = score === "" ? 0 : parseInt(score) || 0;
    return sum + numScore;
  }, 0);

  // Salvăm datele automat
  saveData();

  renderTable();
}

// Funcție pentru adăugarea unei noi runde
function addRound() {
  numberOfRounds++;

  // Asigură-te că toate echipele au noua rundă
  tableData.forEach((row) => {
    if (row.runde.length < numberOfRounds) {
      row.runde.push("");
    }
  });

  // Actualizează antetul și tabelul
  updateTableHeader();
  renderTable();

  // Salvăm datele automat
  saveData();
}

// Funcție pentru editarea titlului quizului
function editTitle() {
  const newTitle = prompt("Introduceți noul titlu al quizului:", quizTitle);
  if (newTitle !== null && newTitle.trim() !== "") {
    quizTitle = newTitle.trim();
    quizTitleElement.textContent = quizTitle;
    saveData(); // Salvează și titlul
  }
}

// Funcție pentru salvarea datelor în local storage
function saveData() {
  const saveObject = {
    tableData: tableData,
    numberOfRounds: numberOfRounds,
    quizTitle: quizTitle,
  };

  localStorage.setItem("quizData", JSON.stringify(saveObject));
  // Nu mai afișăm alerta pentru a nu întrerupe utilizatorul
}

// Funcție pentru generarea graficului
function generateChart() {
  // Salvăm datele înainte de a genera graficul
  saveData();

  // Deschide graficul într-o filă nouă
  openChartInNewTab();
}

// Funcție pentru deschiderea graficului într-o filă nouă
function openChartInNewTab() {
  const newWindow = window.open("", "_blank");

  // Pregătim datele pentru grafic - sortate după puncte total
  const chartData = [...tableData].sort(
    (a, b) => b.puncteTotal - a.puncteTotal
  );

  // Culorile pentru rundele diferite - mai vii și mai contrastante
  const roundColors = [
    "rgba(41, 128, 185, 0.8)", // Albastru pentru Runda 1
    "rgba(192, 57, 43, 0.8)", // Roșu pentru Runda 2
    "rgba(39, 174, 96, 0.8)", // Verde pentru Runda 3
    "rgba(142, 68, 173, 0.8)", // Violet pentru Runda 4
    "rgba(243, 156, 18, 0.8)", // Portocaliu pentru Runda 5
    "rgba(22, 160, 133, 0.8)", // Turcoaz pentru Runda 6
  ];

  // Culori pentru border-uri - mai închise pentru contrast mai bun
  const roundBorderColors = [
    "rgba(41, 128, 185, 1)",
    "rgba(192, 57, 43, 1)",
    "rgba(39, 174, 96, 1)",
    "rgba(142, 68, 173, 1)",
    "rgba(243, 156, 18, 1)",
    "rgba(22, 160, 133, 1)",
  ];

  // Pregătim datasets pentru chart.js cu culori pentru runde
  const datasetsRounds = [];

  // Creăm câte un dataset pentru fiecare rundă
  for (let i = 0; i < numberOfRounds; i++) {
    datasetsRounds.push({
      label: `Runda ${i + 1}`,
      data: chartData.map((item) => {
        const score = item.runde[i];
        return score === "" ? 0 : parseInt(score) || 0;
      }),
      backgroundColor: roundColors[i % roundColors.length],
      borderColor: roundBorderColors[i % roundBorderColors.length],
      borderWidth: 2, // Bordură mai groasă pentru contrast
    });
  }

  // HTML pentru pagina nouă - cu tema întunecată
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${quizTitle}</title>
        <link rel="icon" href="clasament.ico" type="image/x-icon">
        <style>
            body { 
                font-family: 'Segoe UI', Roboto, Arial, sans-serif;
                margin: 20px;
                text-align: center;
                background-color: #121212;
                color: #e1e1e1;
            }
            .chart-container {
                width: 900px;
                height: 600px;
                margin: 0 auto;
                background-color: #1e1e1e;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            }
            h1 { 
                color: #3a8ff7; 
                font-size: 2.2rem;
                margin-bottom: 30px;
            }
            .button-container {
                margin: 30px auto;
                text-align: center;
            }
            .action-btn {
                background-color: #3a8ff7;
                color: white;
                border: none;
                padding: 12px 18px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                margin: 0 10px;
                transition: all 0.2s ease;
            }
            .download-btn {
                background-color: #2ecc71;
            }
            .action-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
            }
            
            @media print {
                body {
                    background-color: white;
                    color: black;
                }
                .chart-container {
                    background-color: white;
                    box-shadow: none;
                }
                .button-container {
                    display: none;
                }
            }
        </style>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
    </head>
    <body>
        <h1>${quizTitle}</h1>
        <div class="chart-container">
            <canvas id="chartCanvas"></canvas>
        </div>
        
        <div class="button-container">
            <button class="action-btn" onclick="window.print()">Printează</button>
            <button class="action-btn download-btn" onclick="downloadChart()">Descarcă Imagine</button>
        </div>
        
        <script>
            // Date pentru grafic
            const chartData = ${JSON.stringify(chartData)};
            
            // Creează graficul
            const ctx = document.getElementById('chartCanvas').getContext('2d');
            const chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.map(item => item.nume),
                    datasets: ${JSON.stringify(datasetsRounds)}
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                color: '#e1e1e1',
                                font: {
                                    size: 14,
                                    weight: 'bold'
                                },
                                padding: 20
                            }
                        },
                        title: {
                            display: true,
                            text: '${quizTitle}',
                            font: {
                                size: 20,
                                weight: 'bold'
                            },
                            color: '#e1e1e1',
                            padding: 20
                        },
                        tooltip: {
                            mode: 'point',
                            position: 'nearest',
                            callbacks: {
                                title: function(tooltipItems) {
                                    return tooltipItems[0].label;
                                },
                                footer: function(tooltipItems) {
                                    // Calculăm totalul pentru această echipă
                                    const teamIndex = tooltipItems[0].dataIndex;
                                    const team = chartData[teamIndex];
                                    return 'Total: ' + team.puncteTotal + ' puncte';
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Puncte',
                                color: '#e1e1e1',
                                font: {
                                    size: 14,
                                    weight: 'bold'
                                }
                            },
                            stacked: true,
                            ticks: {
                                color: '#e1e1e1',
                                font: {
                                    size: 12
                                },
                                padding: 10
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        },
                        x: {
                            ticks: {
                                autoSkip: false,
                                maxRotation: 45,
                                minRotation: 45,
                                color: '#e1e1e1',
                                font: {
                                    size: 16,  // Mărim fontul pentru nume echipe 
                                    weight: 'bold'
                                },
                                padding: 10
                            },
                            stacked: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            }
                        }
                    }
                },
                plugins: [{
                    afterDraw: function(chart) {
                        const ctx = chart.ctx;
                        ctx.font = 'bold 14px Arial'; // Font mai mare pentru punctaje
                        ctx.textAlign = 'center';
                        ctx.fillStyle = '#ffffff';
                        
                        // Calculăm totalul pentru fiecare echipă și îl afișăm deasupra bar-ului
                        chartData.forEach((team, index) => {
                            // Calculăm poziția x și y a bar-ului
                            const meta = chart.getDatasetMeta(numberOfRounds - 1);
                            const bar = meta.data[index];
                            
                            // Adăugăm padding pentru a evita ca textul să iasă din grafic
                            const paddingTop = 25;
                            
                            // Afișăm totalul deasupra bar-ului cu padding
                            ctx.fillText(
                                team.puncteTotal + ' p', 
                                bar.x,
                                bar.y - paddingTop
                            );
                        });
                    }
                }]
            });
            
            // Funcție pentru descărcarea graficului ca imagine
            function downloadChart() {
                const canvas = document.getElementById('chartCanvas');
                const image = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = 'grafic_clasament_quiz.png';
                link.href = image;
                link.click();
            }
        </script>
    </body>
    </html>
  `;

  newWindow.document.write(html);
  newWindow.document.close();
}

// Funcție pentru exportul datelor în format Excel
function exportToExcel() {
  // Pregătește datele pentru Excel - sortate după punctaj
  const sortedData = [...tableData].sort(
    (a, b) => b.puncteTotal - a.puncteTotal
  );
  const worksheetData = [];

  // Adaugă header-ul
  const header = ["Loc", "NUME", "Puncte Total"];
  for (let i = 0; i < numberOfRounds; i++) {
    header.push(`Runda ${i + 1}`);
  }
  worksheetData.push(header);

  // Adaugă datele
  sortedData.forEach((row, index) => {
    const excelRow = [index + 1, row.nume, row.puncteTotal];
    for (let i = 0; i < numberOfRounds; i++) {
      excelRow.push(row.runde[i] === "" ? "" : row.runde[i]);
    }
    worksheetData.push(excelRow);
  });

  // Creează un workbook și un worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Adaugă worksheet la workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Rezultate Quiz");

  // Generează fișierul Excel
  XLSX.writeFile(workbook, "rezultate_quiz.xlsx");
}
