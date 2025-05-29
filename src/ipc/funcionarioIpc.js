// ./src/ipc/funcionarioIpc.js >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const { ipcMain } = require("electron");
const { Funcionario } = require("../models/Funcionario.js");

ipcMain.handle("funcionario:get", (event, id) => {
    const funcionario = new Funcionario(id);
    funcionario.getDados();
    return funcionario;
});

ipcMain.handle("funcionario:delete", (event, id) => {
    const funcionario = new Funcionario(id);
    funcionario.delete();
    return true;
});

ipcMain.handle("funcionario:insert", (event, data) => {
    const novoFuncionario = new Funcionario();
    Object.assign(novoFuncionario, data);
    novoFuncionario.insert();
    return novoFuncionario.id;
});

ipcMain.handle("funcionario:update", (event, data) => {
    const funcionario = new Funcionario(data.id);
    Object.assign(funcionario, data);
    funcionario.update();
    return true;
});

ipcMain.handle("get-funcionarios:filter", (event, filters) => {
    try {
        let query = `
        SELECT 
            f.id, f.nome, f.contato, sf.status_funcionario 
        FROM 
            tabFuncionarios AS f 
        INNER JOIN
            tabStatusFuncionario AS sf ON f.status_funcionario = sf.id
        WHERE 1=1 
        `;
        const params = [];

        if (filters.nome) {
            query += `AND f.nome LIKE ? `;
            params.push(`%${filters.nome}%`);
        }

        if (filters.contato) {
            query += `AND f.contato LIKE ? `;
            params.push(`%${filters.contato}%`);
        }

        if (filters.status_funcionario) {
            query += `AND f.status_funcionario =? `;
            params.push(`${filters.status_funcionario}`);
        }
        const db = Funcionario.getConexao();
        const stmt = db.prepare(query);
        return stmt.all(...params);
    } catch (error) {
        console.error("Erro ao filtrar funcionarios", error);
    }
});
