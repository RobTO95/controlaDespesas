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
let tabelaColNameClick = "";

export async function openDespesas() {
	/* -------------------------- 🏷️ Carregar Tabela -------------------------- */
	tabela = new TabelaInterativa(document.getElementById("table-despesas"));
	tabela.setOnColunaClick((nomeColuna, indiceColuna) => {
		// console.log(`Coluna clicada: ${nomeColuna}, índice: ${indiceColuna}`);
		// Aqui você pode fazer qualquer lógica personalizada (ex: ordenação)
		const orderBy = {};
		if (nomeColuna === tabelaColNameClick) {
			orderBy.order = "DESC";
			tabelaColNameClick = "";
		} else {
			orderBy.order = "ASC";
			tabelaColNameClick = nomeColuna;
		}

		// d.id, d.descricao, c.categoria, d.valor, d.data, s.status_despesa
		if (nomeColuna === "categoria") {
			orderBy.name = `c.${nomeColuna}`;
		} else if (nomeColuna === "status_despesa") {
			orderBy.name = `s.${nomeColuna}`;
		} else {
			orderBy.name = `d.${nomeColuna}`;
		}
		carregarDespesas(orderBy);
	});
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
	// filters
	const inputDescricao = document.getElementById("descricao-filter");
	const inputValor = document.getElementById("valor-filter");
	const inputData = document.getElementById("data-filter");
	const selectCategoria = document.getElementById("categoria-filter");
	const selectSatusDespesa = document.getElementById("status-despesa-filter");

	inputDescricao.addEventListener("input", carregarDespesas);
	inputValor.addEventListener("input", carregarDespesas);
	inputData.addEventListener("input", carregarDespesas);
	selectCategoria.addEventListener("change", carregarDespesas);
	selectSatusDespesa.addEventListener("change", carregarDespesas);

	const selectCategoriaFilter = new SelectInterativo(selectCategoria);
	const selectSatusDespesaFilter = new SelectInterativo(selectSatusDespesa);

	selectCategoriaFilter.load(
		await window.api.invoke("get-categoria-despesa"),
		"id",
		"categoria",
		true,
		"Categorias"
	);

	selectSatusDespesaFilter.load(
		await window.api.invoke("get-status-despesa"),
		"id",
		"status_despesa",
		true,
		"Status"
	);
	//botões controle filters
	const btnSearch = document.getElementById("search");
	const btnClear = document.getElementById("clear");

	btnSearch.addEventListener("click", carregarDespesas);
	btnClear.addEventListener("click", () => {
		inputDescricao.value = "";
		inputValor.value = "";
		inputData.value = "";
		selectCategoria.value = "";
		selectSatusDespesa.value = "";
		carregarDespesas();
	});

	// Função carregar despesa
	async function carregarDespesas(orderBy = {}) {
		const filters = {};

		if (inputDescricao.value) {
			filters.descricao = inputDescricao.value;
		}

		if (inputValor.value) {
			filters.valor = inputValor.value;
		}

		if (inputData.value) {
			filters.data = inputData.value;
		}

		if (selectCategoria.value) {
			filters.categoria = selectCategoria.value;
		}

		if (selectSatusDespesa.value) {
			filters.status_despesa = selectSatusDespesa.value;
		}

		const despesas = await window.api.invoke(
			"get-despesas:filters",
			filters,
			orderBy
		);

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

	carregarDespesas();
}
