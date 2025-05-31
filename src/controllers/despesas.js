import TabelaInterativa from "../models/TabelaInterativa.js";
import SelectInterativo from "../models/SelectInterativo.js";
import {
	formatarMoedaBR,
	formatarDataParaBR,
	converterDataParaISO,
} from "../utils/formaters.js";
import {
	loadModalDespesa,
	preencherFormularioDespesa,
} from "./modal-despesas.js";

let tabela;

export async function openDespesas() {
	/* -------------------------- 🏷️ Carregar Tabela -------------------------- */
	tabela = new TabelaInterativa(document.getElementById("table-despesas"));
	carregarDespesas();

	/* ----------------------- 🏷️ Instanciar Selects FILTER ------------------------ */
	const selectCategoriaFilter = new SelectInterativo(
		document.getElementById("categoria-filter")
	);

	selectCategoriaFilter.load(
		await window.api.invoke("get-categoria-despesa"),
		"id",
		"categoria",
		true,
		"Categorias"
	);

	/* --------------------- 🏷️ Modal e Controle de Formulário --------------------- */
	const btnAdd = document.getElementById("add");
	const btnEdit = document.getElementById("edit");
	const btnDelete = document.getElementById("delete");
	const btnUpdate = document.getElementById("update");

	// Atualiza tabela
	btnUpdate.addEventListener("click", carregarDespesas);

	// Abrir modal para nova despesa
	btnAdd.addEventListener("click", async () => {
		await loadModalDespesa("despesas");
	});

	// Botão Editar
	btnEdit.addEventListener("click", async () => {
		const idSelecionado = tabela.getSelectedRowId();
		if (!idSelecionado) return alert("Selecione uma despesa para editar.");
		await loadModalDespesa("despesas");
		preencherFormularioDespesa(idSelecionado);
	});

	// Botão remover despesa
	btnDelete.addEventListener("click", async () => {
		const idSelecionado = tabela.getSelectedRowId();
		if (!idSelecionado)
			return alert("Por favor, selecione uma despesa para excluir.");
		if (confirm("Tem certeza que deseja excluir esta despesa?")) {
			try {
				await window.api.invoke("despesa:delete", idSelecionado);
				await carregarDespesas();
			} catch (error) {
				console.error("Erro ao excluir despesa:", error);
			}
		}
	});

	//Evento atualizar tabela
	window.addEventListener("atualizarTabelaDespesas", async () => {
		if (tabela) {
			await carregarDespesas();
		}
	});
}

async function carregarDespesas() {
	const despesas = await window.api.invoke("get-despesas");
	const despesasFormatadas = despesas.map((despesa) => ({
		...despesa,
		data: formatarDataParaBR(despesa.data),
		valor: formatarMoedaBR(despesa.valor),
	}));

	const colunasCustom = {
		id: "ID",
		descricao: "Descrição",
		categoria: "Categoria",
		valor: "Valor (R$)",
		data: "Data",
		status_despesa: "Status",
	};
	tabela.load(despesasFormatadas, colunasCustom);
}
