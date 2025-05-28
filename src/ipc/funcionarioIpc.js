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
