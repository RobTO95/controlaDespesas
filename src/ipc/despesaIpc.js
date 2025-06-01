// ./src/ipc/despesaIpc.js >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const { ipcMain } = require("electron");
const { Despesa } = require("../models/Despesa.js");

// Handler para buscar as despesas filtradas
ipcMain.handle("get-despesas:filters", (event, filters = {}, orderBy = {}) => {
	try {
		let query = `
		SELECT 
			d.id, d.descricao, c.categoria, d.valor, d.data, s.status_despesa 
		FROM 
			tabDespesas AS d 
		INNER JOIN 
			tabCategoria AS c ON d.categoria = c.id 
		INNER JOIN 
			tabStatusDespesa AS s ON d.status_despesa = s.id `;

		const params = [];

		if (filters.descricao) {
			query += ` AND d.descricao LIKE ? `;
			params.push(`%${filters.descricao}%`);
		}

		if (filters.categoria) {
			query += ` AND d.categoria = ? `;
			params.push(`${filters.categoria}`);
		}

		if (filters.valor) {
			query += ` AND d.valor = ? `;
			params.push(`${filters.valor}`);
		}

		if (filters.data) {
			query += ` AND d.data >= ? `;
			params.push(`${filters.data}`);
		}

		if (filters.status_despesa) {
			query += ` AND d.status_despesa = ? `;
			params.push(`${filters.status_despesa}`);
		}

		if (orderBy.name) {
			query += ` ORDER BY ${orderBy.name}`;
		}

		if (orderBy.order) {
			query += ` ${orderBy.order}`;
		}

		const db = Despesa.getConexao();
		const stmt = db.prepare(query);
		return stmt.all(...params);
	} catch (e) {
		console.error("Erro ao buscar despesas", e);
		return [];
	}
});

// Handler para buscar todas as despesas
ipcMain.handle("despesa:getAll", () => {
	const despesas = Despesa.getAll();
	return despesas; // Puxa todas as despesas do banco
});

// Handler para buscar uma despesa por ID
ipcMain.handle("despesa:get", (event, id) => {
	const despesa = new Despesa(id);
	despesa.getDados();
	return despesa;
});

// Handler para inserir nova despesa
ipcMain.handle("despesa:insert", (event, data) => {
	const novaDespesa = new Despesa();
	Object.assign(novaDespesa, data);
	novaDespesa.insert();
	return novaDespesa.id;
});

// Handler para atualizar despesa
ipcMain.handle("despesa:update", (event, data) => {
	const despesa = new Despesa(data.id);
	Object.assign(despesa, data);
	despesa.update();
	return true;
});

// Handler para deletar despesa
ipcMain.handle("despesa:delete", async (event, id) => {
	const despesa = new Despesa(id);
	await despesa.delete();
	return true;
});
