import * as zoomPlugin from "../vendor/chartjs-plugin-zoom/chartjs-plugin-zoom.umd.min.js";
Chart.register(zoomPlugin.default || zoomPlugin);

// Chart.js já está disponível globalmente graças à tag <script> no HTML
const despesas = await window.api.getDespesas({ name: "d.data" });

const ctx = document.getElementById("meuGrafico").getContext("2d");
const timelineChart = createTimelineChart(ctx, despesas);

// Criação do gráfico >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
let currentLevel = "month"; // 'year', 'month', 'day'

function createTimelineChart(ctx, data) {
    const yearData = aggregateByYear(data);
    const monthData = aggregateByMonth(data);
    const dayData = aggregateByDay(data);
    const xMin = new Date(
        Math.min(...aggregateByDay(data).map((p) => p.x.getTime()))
    );
    const xMax = new Date(
        Math.max(...aggregateByDay(data).map((p) => p.x.getTime()))
    );

    const config = {
        type: "line",
        data: {
            datasets: [
                {
                    label: "Total despesas",
                    data: yearData,
                    // borderColor: "rgba(0,250,0,0.5)",
                    fill: true,
                    backgroundColor: "rgba(0, 0, 255, 0.2)",
                    tension: 0,
                },
            ],
        },
        options: {
            parsing: {
                xAxisKey: "x",
                yAxisKey: "y",
            },
            scales: {
                x: {
                    type: "time",
                    time: {
                        unit: "year",
                        displayFormats: {
                            year: "yyyy",
                            month: "MMM yyyy",
                            day: "dd MMM",
                            // day: "dd/MM/yyyy",
                        },
                    },
                    title: {
                        display: true,
                        text: "Data",
                    },
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: "Valor (R$)",
                    },
                },
            },
            plugins: {
                // tooltip: false,
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const valor = context.parsed.y;
                            const data = context.parsed.x;

                            // Formatar a data manualmente em pt-BR - só dia e mês, ou ano, dependendo do nível
                            const dt = new Date(data);
                            // Exemplo simples: dia/mês/ano
                            const dataFormatada = dt.toLocaleDateString(
                                "pt-BR",
                                {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                }
                            );

                            const valorFormatado = valor.toLocaleString(
                                "pt-BR",
                                {
                                    style: "currency",
                                    currency: "BRL",
                                }
                            );

                            return `${dataFormatada}: ${valorFormatado}`;
                        },
                    },
                },
                zoom: {
                    pan: {
                        enabled: true, // Ativa o pan
                        mode: "x", // Só na horizontal (x), pode ser "x", "y" ou "xy"
                        modifierKey: "ctrl", // (opcional) segura CTRL para pan, útil se quiser evitar pan acidental
                    },
                    zoom: {
                        wheel: { enabled: true },
                        pinch: { enabled: true },
                        mode: "x",
                        onZoomComplete: ({ chart }) => handleZoomChange(chart),
                    },
                    limits: {
                        x: {
                            minRange: 1000 * 60 * 60 * 24 * 7, // mínimo de 7 dias visíveis
                            maxRange: 1000 * 60 * 60 * 24 * 365, // máximo de 1 ano visíveis
                        },
                    },
                },
            },
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: "nearest",
            },
        },
    };

    return new Chart(ctx, config);
}

function handleZoomChange(chart) {
    const xScale = chart.scales.x;
    const min = xScale.getUserBounds().min;
    const max = xScale.getUserBounds().max;

    if (typeof min !== "number" || typeof max !== "number") return;
    const range = max - min;

    const oneYear = 365 * 24 * 60 * 60 * 1000;
    const oneMonth = 30 * 24 * 60 * 60 * 1000;

    let newLevel;
    if (range > oneYear * 2) {
        newLevel = "year";
    } else if (range > oneMonth * 1.5) {
        newLevel = "month";
    } else {
        newLevel = "day";
    }
    console.log("Nível do zoom:", newLevel);

    if (newLevel !== currentLevel) {
        currentLevel = newLevel;

        let newData;
        let timeUnit;
        switch (newLevel) {
            case "year":
                newData = aggregateByYear(despesas);
                timeUnit = "year";
                break;
            case "month":
                newData = aggregateByMonth(despesas);
                timeUnit = "month";
                break;
            case "day":
                newData = aggregateByDay(despesas);
                timeUnit = "day";
                break;
        }

        chart.data.datasets[0].data = newData;
        chart.options.scales.x.time.unit = timeUnit;

        // Manter o intervalo atual visível
        chart.options.scales.x.min = min;
        chart.options.scales.x.max = max;

        chart.update();
    }
}

// Funções para timeline >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

function parseDate(str) {
    // Suporta "11/05/2025" e "2025-06-08"
    const parts = str.includes("/") ? str.split("/") : str.split("-").reverse();
    const [day, month, year] = parts.map(Number);
    return new Date(year, month - 1, day);
}

function aggregateByYear(data) {
    const map = {};
    data.forEach((d) => {
        const dt = parseDate(d.data);
        const year = dt.getFullYear();
        map[year] = (map[year] || 0) + d.valor;
    });
    const result = Object.entries(map).map(([year, total]) => ({
        x: new Date(year, 0),
        y: total,
    }));
    return result.sort((a, b) => a.x - b.x);
}

function aggregateByMonth(data) {
    const map = {};
    data.forEach((d) => {
        const dt = parseDate(d.data);
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
            2,
            "0"
        )}`;
        map[key] = (map[key] || 0) + d.valor;
    });
    const result = Object.entries(map).map(([ym, total]) => {
        const [year, month] = ym.split("-").map(Number);
        return { x: new Date(year, month - 1), y: total };
    });
    return result.sort((a, b) => a.x - b.x);
}

function aggregateByDay(data) {
    const map = {};
    data.forEach((d) => {
        const dt = parseDate(d.data);
        const key = dt.toISOString().slice(0, 10);
        map[key] = (map[key] || 0) + d.valor;
    });
    const result = Object.entries(map).map(([day, total]) => {
        return { x: new Date(day), y: total };
    });
    return result.sort((a, b) => a.x - b.x);
}
