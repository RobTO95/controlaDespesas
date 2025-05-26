// ./src/ipc/funcionarioIpc.js >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const { ipcMain } = require("electron");
const { Funcionario } = require("../models/Funcionario.js");

ipcMain.handle("funcionario:delete", (event, id) => {
    const funcionario = new Funcionario(id);
    funcionario.delete();
    return true;
});
