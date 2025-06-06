// main.js
const { app, BrowserWindow, ipcMain, Menu } = require("electron");

const path = require("path");
const Database = require("better-sqlite3");

// Configurando o banco
const dbPath = path.join(__dirname, "src", "data", "data.db"); // ajuste o caminho se necessário
// const db = new Database(dbPath, { verbose: console.log });
const db = new Database(dbPath);

function createWindow() {
    const win = new BrowserWindow({
        width: 1100,
        height: 650,
        icon: "./src/public/img/logo.png",
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, "src", "preload.js"),
        },
    });
    win.loadFile(path.join(__dirname, "src", "index.html"));
    // win.webContents.openDevTools(); // Modo desenvolvedor
    win.maximize();
}

app.whenReady().then(() => {
    createWindow();
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// Carrega os handlers do IPC >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const despesaIpc = require("./src/ipc/despesaIpc.js");
const funcionarioIpc = require("./src/ipc/funcionarioIpc.js");
const despesaFuncionarioIpc = require("./src/ipc/despesaFuncionarioIpc.js");
const { exportToExcel } = require("./src/utils/export.js");
const { error } = require("console");

// Comunicação para enviar dados >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
ipcMain.handle("export:excel", async (event, data, name) => {
    const result = await exportToExcel(data, name);
    if (result === true) {
        return { success: true };
    } else {
        return { success: false, error: result.message || String(result) };
    }
});

ipcMain.handle("get-despesas", (orderBy = {}) => {
    try {
        const query = `
		SELECT 
			d.id, d.descricao, c.categoria, d.valor, d.data, s.status_despesa 
		FROM 
			tabDespesas AS d 
		INNER JOIN 
			tabCategoria AS c ON d.categoria = c.id 
		INNER JOIN 
			tabStatusDespesa AS s ON d.status_despesa = s.id`;

        if (orderBy.name) {
            query += ` ORDER BY ${orderBy.name}`;
            if (orderBy.order) {
                query += ` ${orderBy.name}`;
            }
        }
        const despesas = db.prepare(query).all();
        return despesas;
    } catch (e) {
        console.error("Erro ao buscar despesas", e);
        return [];
    }
});

ipcMain.handle("get-categoria-despesa", () => {
    try {
        const query = `
		SELECT 
			id,
			categoria 
		FROM 
			tabCategoria`;

        const categorias = db.prepare(query).all();

        return categorias;
    } catch (e) {
        console.error("Erro ao buscar categoria", e);
        return [];
    }
});

ipcMain.handle("get-forma-pagamento", () => {
    try {
        const query = `
		SELECT 
			id,
			forma_pagamento 
		FROM 
			tabFormaPagamento`;

        const forma_pagamento = db.prepare(query).all();

        return forma_pagamento;
    } catch (e) {
        console.error("Erro ao buscar forma de pagamento", e);
        return [];
    }
});

ipcMain.handle("get-tipo-pagamento", () => {
    try {
        const query = `
		SELECT 
			id,
			tipo_pagamento 
		FROM 
			tabTipoPagamento`;

        const tipo_pagamento = db.prepare(query).all();

        return tipo_pagamento;
    } catch (e) {
        console.error("Erro ao buscar tipo de pagamento", e);
        return [];
    }
});

ipcMain.handle("get-status-despesa", () => {
    try {
        const query = `
		SELECT 
			id,
			status_despesa 
		FROM 
			tabStatusDespesa`;

        const status_despesa = db.prepare(query).all();

        return status_despesa;
    } catch (e) {
        console.error("Erro ao buscar status despesa", e);
        return [];
    }
});

// Funcionarios >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
ipcMain.handle("get-funcionarios", () => {
    try {
        const query = `
		SELECT 
			f.id, f.nome, f.contato, s.status_funcionario
		FROM
			tabFuncionarios AS f
		INNER JOIN 
			tabStatusFuncionario AS s ON f.status_funcionario = s.id
		`;
        const funcionarios = db.prepare(query).all();

        return funcionarios;
    } catch {
        console.log("Erro ao buscar funcionarios ", e);
        return [];
    }
});

ipcMain.handle("get-status-funcionario", () => {
    try {
        const query = `
		SELECT 
			id,
			status_funcionario
		FROM 
			tabStatusFuncionario`;

        const status_despesa = db.prepare(query).all();

        return status_despesa;
    } catch (e) {
        console.error("Erro ao buscar status funcionario", e);
        return [];
    }
});

ipcMain.handle("get-vinculo-funcionario", () => {
    try {
        const query = `
		SELECT 
			id,
			vinculo_funcionario
		FROM 
			tabVinculoFuncionario`;

        const status_despesa = db.prepare(query).all();

        return status_despesa;
    } catch (e) {
        console.error("Erro ao buscar status funcionario", e);
        return [];
    }
});

ipcMain.handle("get-sexo", () => {
    try {
        const query = `
		SELECT 
			id,
			sexo
		FROM 
			tabSexo`;

        const status_despesa = db.prepare(query).all();

        return status_despesa;
    } catch (e) {
        console.error("Erro ao buscar status funcionario", e);
        return [];
    }
});
// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
