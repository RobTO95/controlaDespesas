const { ipcMain } = require("electron");
const { DespesaFuncionario } = require("../models/DespesaFuncionario");
const { Funcionario } = require("../models/Funcionario");
const { Despesa } = require("../models/Despesa");

ipcMain.handle(
    "despesa-funcionario:get-all-on-funcionario",
    (event, id_funcionario) => {
        const despesaFuncionario = new DespesaFuncionario();
        despesaFuncionario.id_funcionario = id_funcionario;
        return despesaFuncionario.getDespesaForIdFuncionario();
    }
);
