// ./src/ipc/despesaIpc.js >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
const { ipcMain } = require("electron");
const { Despesa } = require("../models/Despesa.js");

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
ipcMain.handle("despesa:delete", (event, id) => {
    const despesa = new Despesa(id);
    despesa.delete();
    return true;
});
