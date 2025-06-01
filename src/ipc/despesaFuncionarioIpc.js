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

ipcMain.handle(
	"despesa-funcionario:insert",
	(event, id_despesa, id_funcionario) => {
		const despesaFuncionario = new DespesaFuncionario();
		despesaFuncionario.id_despesa = id_despesa;
		despesaFuncionario.id_funcionario = id_funcionario;
		despesaFuncionario.insert();
	}
);

ipcMain.handle(
	"despesa-funcionario:delete",
	(event, id_despesa_funcionario) => {
		try {
			const despesaFuncionario = new DespesaFuncionario(id_despesa_funcionario);
			despesaFuncionario.getDados();
			const despesa = new Despesa(despesaFuncionario.id_despesa);
			despesa.delete();
		} catch (error) {
			console.error("Erro ao deletar pagamento: ", error);
		}
	}
);
