import TabelaInterativa from "../models/TabelaInterativa.js";
import SelectInterativo from "../models/SelectInterativo.js";

/* -------------------------- 🏷️ Variáveis Globais -------------------------- */
let categorias = [];
let formaPagamento = [];
let tipoPagamento = [];
let statusDespesa = [];

/* ------------------------ 🏷️ Instanciar Tabela ------------------------- */
export async function carregarDespesas() {
	const despesas = await window.api.invoke("get-despesas");

	const despesasFormatadas = despesas.map((despesa) => ({
		...despesa,
		data: formatarDataParaBR(despesa.data),
	}));

	const tabela = new TabelaInterativa(
		document.getElementById("table-despesas")
	);
	const colunasCustom = {
		descricao: "Descrição",
		categoria: "Categoria",
		valor: "Valor (R$)",
		data: "Data",
		status_despesa: "Status",
	};
	tabela.load(despesasFormatadas, colunasCustom);
}

/* ---------------------- 🏷️ Utilitários de Formatação ---------------------- */
function formatarDataParaBR(dataISO) {
	if (!dataISO) return "";
	if (dataISO.includes("/")) return dataISO; // Já no formato BR
	const [ano, mes, dia] = dataISO.substring(0, 10).split("-");
	return `${dia}/${mes}/${ano}`;
}

function converterDataParaISO(dataBR) {
	if (!dataBR) return "";
	if (/^\d{4}-\d{2}-\d{2}$/.test(dataBR)) return dataBR;
	const [dia, mes, ano] = dataBR.split("/");
	if (!dia || !mes || !ano) return "";
	return `${ano.padStart(4, "0")}-${mes.padStart(2, "0")}-${dia.padStart(
		2,
		"0"
	)}`;
}

/* ----------------------- 🏷️ Instanciar Selects ------------------------ */
const selectCategoriaFilter = new SelectInterativo(
	document.getElementById("categoria-filter")
);
const selectCategoriaModal = new SelectInterativo(
	document.getElementById("categoria")
);
const selectFormaPagamentoModal = new SelectInterativo(
	document.getElementById("forma_pagamento")
);
const selectTipoPagamentoModal = new SelectInterativo(
	document.getElementById("tipo_pagamento")
);
const selectStatusDespesaModal = new SelectInterativo(
	document.getElementById("status_despesa")
);

export async function carregarSelects() {
	categorias = await window.api.invoke("get-categoria-despesa");
	formaPagamento = await window.api.invoke("get-forma-pagamento");
	tipoPagamento = await window.api.invoke("get-tipo-pagamento");
	statusDespesa = await window.api.invoke("get-status-despesa");

	selectCategoriaFilter.load(categorias, "id", "categoria", true, "Categorias");
	selectCategoriaModal.load(categorias, "id", "categoria", true, "Categorias");
	selectFormaPagamentoModal.load(
		formaPagamento,
		"id",
		"forma_pagamento",
		true,
		"Formas de pagamento"
	);
	selectTipoPagamentoModal.load(
		tipoPagamento,
		"id",
		"tipo_pagamento",
		true,
		"Tipo de pagamento"
	);
	selectStatusDespesaModal.load(
		statusDespesa,
		"id",
		"status_despesa",
		true,
		"Status despesa"
	);
}

/* --------------------- 🏷️ Modal e Controle de Formulário --------------------- */
const btnAdd = document.getElementById("add");
const btnEdit = document.getElementById("edit");
const btnDelete = document.getElementById("delete");
const modal = document.getElementById("modal-despesa");
const closeModal = document.getElementById("close-modal");
const formDespesa = document.getElementById("form-despesa");

// Abrir modal para nova despesa
btnAdd.addEventListener("click", () => (modal.style.display = "block"));

// Fechar modal
closeModal.addEventListener("click", () => (modal.style.display = "none"));
window.addEventListener("click", (e) => {
	if (e.target === modal) modal.style.display = "none";
});

/* ------------------ 🏷️ Preencher Formulário para Edição ------------------ */
async function preencherFormularioDespesa(id) {
	try {
		const despesa = await window.api.invoke("despesa:get", id);
		formDespesa.elements["descricao"].value = despesa.descricao || "";
		formDespesa.elements["categoria"].value = despesa.categoria || "";
		formDespesa.elements["valor"].value = despesa.valor || "";
		formDespesa.elements["data"].value =
			converterDataParaISO(despesa.data) || "";
		formDespesa.elements["forma_pagamento"].value =
			despesa.forma_pagamento || "";
		formDespesa.elements["tipo_pagamento"].value = despesa.tipo_pagamento || "";
		formDespesa.elements["status_despesa"].value = despesa.status_despesa || "";
		formDespesa.elements["observacao"].value = despesa.observacao || "";
		formDespesa.dataset.editingId = id;
	} catch (error) {
		console.error("Erro ao carregar despesa para edição:", error);
	}
}

// Botão Editar
btnEdit.addEventListener("click", () => {
	const tabela = new TabelaInterativa(
		document.getElementById("table-despesas")
	);
	const idSelecionado = tabela.getSelectedRowId();
	if (!idSelecionado) return alert("Selecione uma despesa para editar.");
	preencherFormularioDespesa(idSelecionado);
	modal.style.display = "block";
});

/* ---------------------- 🏷️ Submeter Formulário ---------------------- */
formDespesa.addEventListener("submit", async (event) => {
	event.preventDefault();
	const formData = new FormData(formDespesa);
	const despesaData = Object.fromEntries(formData.entries());
	try {
		if (formDespesa.dataset.editingId) {
			despesaData.id = formDespesa.dataset.editingId;
			await window.api.invoke("despesa:update", despesaData);
			delete formDespesa.dataset.editingId;
			console.log("Despesa atualizada:", despesaData);
		} else {
			await window.api.invoke("despesa:insert", despesaData);
			console.log("Despesa inserida:", despesaData);
		}
		await carregarDespesas();
		modal.style.display = "none";
		formDespesa.reset();
	} catch (error) {
		console.error("Erro ao salvar despesa:", error);
	}
});

/* ---------------------- 🏷️ Excluir Despesa ---------------------- */
btnDelete.addEventListener("click", async () => {
	const tabela = new TabelaInterativa(
		document.getElementById("table-despesas")
	);
	const idSelecionado = tabela.getSelectedRowId();
	if (!idSelecionado)
		return alert("Por favor, selecione uma despesa para excluir.");
	if (confirm("Tem certeza que deseja excluir esta despesa?")) {
		try {
			await window.api.invoke("despesa:delete", idSelecionado);
			console.log("Despesa excluída com sucesso!");
			await carregarDespesas();
		} catch (error) {
			console.error("Erro ao excluir despesa:", error);
		}
	}
});
