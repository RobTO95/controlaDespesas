// ./src/ipc/funcionarioIpc.js >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const { ipcMain, dialog } = require("electron");
const { Funcionario } = require("../models/Funcionario.js");
const {
    copyImageToAppFolder,
    deleteImageOnAppFolder,
} = require("../utils/fileManager.js");

ipcMain.handle("funcionario:get", (event, id) => {
    const funcionario = new Funcionario(id);
    funcionario.getDados();
    return funcionario;
});

ipcMain.handle("funcionario:delete", (event, id) => {
    const funcionario = new Funcionario(id);
    deleteImageOnAppFolder(id);
    funcionario.delete();
    return true;
});

ipcMain.handle("funcionario:insert", async (event, data) => {
    const funcionario = new Funcionario();
    Object.assign(funcionario, data);
    funcionario.insert();
    funcionario.imagem = await setImage(funcionario.imagem, funcionario.id);
    funcionario.update();
    return funcionario.id;
});

ipcMain.handle("funcionario:update", async (event, data) => {
    const funcionario = new Funcionario(data.id);
    Object.assign(funcionario, data);
    funcionario.imagem = await setImage(funcionario.imagem, funcionario.id);
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

ipcMain.handle("funcionario:get-image", async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [{ name: "Images", extensions: ["jpg", "png", "gif"] }],
    });
    if (canceled || filePaths.length === 0) return null;
    return filePaths[0]; // Retorna o caminho da imagem selecionada
});

async function setImage(imagePath, id) {
    const destPath = await copyImageToAppFolder(imagePath, id);
    return destPath;
}
