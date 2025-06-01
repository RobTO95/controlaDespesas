// Importação de dependências e utilitários
import TabelaInterativa from "../models/TabelaInterativa.js";
import SelectInterativo from "../models/SelectInterativo.js";
import { formatarMoedaBR, formatarDataParaBR } from "../utils/formaters.js";
import {
	loadModalDespesa,
	preencherFormularioDespesa,
} from "./modal-despesas.js";
import { mostrarConfirmacao, mostrarMensagem } from "../utils/mensagens.js";

let tabela;
let tabelaColNameClick = "";

// Função principal para inicializar e gerenciar a tela de despesas
export async function openDespesas() {
	/* -------------------------- Inicialização da Tabela -------------------------- */
	tabela = new TabelaInterativa(document.getElementById("table-despesas"));

	tabela.setOnColunaClick((nomeColuna, indiceColuna) => {
		const orderBy = determinarOrdenacao(nomeColuna);
		carregarDespesas(orderBy);
	});

	/* ---------------------- Configuração de Botões e Eventos ---------------------- */
	configurarBotoesControle();
	configurarEventosGlobais();
	configurarFiltros();

	// Carregar dados iniciais
	await carregarDespesas();
}

/**
 * Determina a ordenação baseada na coluna clicada
 * @param {string} nomeColuna Nome da coluna clicada
 * @returns {Object} Objeto com critérios de ordenação
 */
function determinarOrdenacao(nomeColuna) {
	const orderBy = {};

	// Alternar ordem ascendente/descendente
	if (nomeColuna === tabelaColNameClick) {
		orderBy.order = "DESC";
		tabelaColNameClick = "";
	} else {
		orderBy.order = "ASC";
		tabelaColNameClick = nomeColuna;
	}

	// Mapeamento das colunas para alias
	if (nomeColuna === "categoria") {
		orderBy.name = `c.${nomeColuna}`;
	} else if (nomeColuna === "status_despesa") {
		orderBy.name = `s.${nomeColuna}`;
	} else {
		orderBy.name = `d.${nomeColuna}`;
	}

	return orderBy;
}

/**
 * Configura os botões de controle de CRUD e atualização
 */
function configurarBotoesControle() {
	const btnAdd = document.getElementById("add");
	const btnEdit = document.getElementById("edit");
	const btnDelete = document.getElementById("delete");
	const btnUpdate = document.getElementById("update");

	btnAdd.addEventListener("click", async () => {
		await loadModalDespesa("despesas");
	});

	btnEdit.addEventListener("click", async () => {
		const id = tabela.getSelectedRowId();
		if (!id) {
			await mostrarMensagem("Selecione uma despesa para editar.");
			return;
		}
		await loadModalDespesa("despesas");
		preencherFormularioDespesa(id);
	});

	btnDelete.addEventListener("click", async () => {
		const id = tabela.getSelectedRowId();
		if (!id) {
			await mostrarMensagem("Por favor, selecione uma despesa para excluir.");
			return;
		}

		const confirmacao = await mostrarConfirmacao(
			"Tem certeza que deseja excluir esta despesa?"
		);
		if (confirmacao) {
			try {
				await window.api.invoke("despesa:delete", id);
				await carregarDespesas();
			} catch (error) {
				console.error("Erro ao excluir despesa:", error);
			}
		}
	});

	btnUpdate.addEventListener("click", carregarDespesas);
}

/**
 * Configura eventos globais como o listener para atualização da tabela
 */
function configurarEventosGlobais() {
	window.addEventListener("atualizarTabelaDespesas", async () => {
		if (tabela) await carregarDespesas();
	});
}

/**
 * Configura filtros e selects interativos
 */
async function configurarFiltros() {
	const inputDescricao = document.getElementById("descricao-filter");
	const inputValor = document.getElementById("valor-filter");
	const inputData = document.getElementById("data-filter");
	const selectCategoria = document.getElementById("categoria-filter");
	const selectStatus = document.getElementById("status-despesa-filter");

	// Carregar opções dos selects
	const selectCategoriaFilter = new SelectInterativo(selectCategoria);
	const selectStatusFilter = new SelectInterativo(selectStatus);

	selectCategoriaFilter.load(
		await window.api.invoke("get-categoria-despesa"),
		"id",
		"categoria",
		true,
		"Categorias"
	);

	selectStatusFilter.load(
		await window.api.invoke("get-status-despesa"),
		"id",
		"status_despesa",
		true,
		"Status"
	);

	// Adicionar eventos de filtro
	[inputDescricao, inputValor, inputData].forEach((input) =>
		input.addEventListener("input", carregarDespesas)
	);
	[selectCategoria, selectStatus].forEach((select) =>
		select.addEventListener("change", carregarDespesas)
	);

	// Botões de busca e limpar filtros
	const btnSearch = document.getElementById("search");
	const btnClear = document.getElementById("clear");

	btnSearch.addEventListener("click", carregarDespesas);
	btnClear.addEventListener("click", () => {
		[inputDescricao, inputValor, inputData].forEach(
			(input) => (input.value = "")
		);
		[selectCategoria, selectStatus].forEach((select) => (select.value = ""));
		carregarDespesas();
	});
}

/**
 * Carrega e atualiza a tabela de despesas com filtros e ordenação
 * @param {Object} orderBy Critério de ordenação (opcional)
 */
async function carregarDespesas(orderBy = {}) {
	const filtros = coletarFiltros();

	const despesas = await window.api.invoke(
		"get-despesas:filters",
		filtros,
		orderBy
	);

	const despesasFormatadas = despesas.map((d) => ({
		...d,
		data: formatarDataParaBR(d.data),
		valor: formatarMoedaBR(d.valor),
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

/**
 * Coleta os filtros ativos da interface
 * @returns {Object} Objeto com filtros aplicados
 */
function coletarFiltros() {
	const filters = {
		descricao: document.getElementById("descricao-filter")
			? document.getElementById("descricao-filter").valor
			: undefined,
		categoria: document.getElementById("categoria-filter")
			? document.getElementById("categoria-filter").value
			: undefined,
		valor: document.getElementById("valor-filter")
			? document.getElementById("valor-filter").value
			: undefined,
		data: document.getElementById("data-filter")
			? document.getElementById("data-filter").value
			: undefined,
		status_despesa: document.getElementById("status-despesa-filter")
			? document.getElementById("status-despesa-filter").value
			: undefined,
	};

	return filters;
}
