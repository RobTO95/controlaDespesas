import SelectInterativo from "../models/SelectInterativo.js";
import { converterDataParaISO } from "../utils/formaters.js";

export async function loadModalDespesa(id_html) {
	try {
		const response = await fetch("./views/modal-despesa.html");
		if (!response.ok) {
			throw new Error(`Erro ao carregar modal.html: ${response.statusText}`);
		}
		const modalHTML = await response.text();
		const wrapper = document.createElement("div");
		wrapper.innerHTML = modalHTML.trim();

		// Adicione o modal ao final do body
		const modal = wrapper.firstChild;
		document.getElementById(id_html).appendChild(modal);
		// Fechar modal
		const closeModal = document.getElementById("close-modal");
		closeModal.addEventListener("click", () => removerModalDespesa(id_html));
		window.addEventListener("click", (e) => {
			if (e.target === modal) removerModalDespesa(id_html);
		});
		// Carregar Selects
		await carregarSelectsModalDespesa();
	} catch (error) {
		console.error("Erro ao carregar o modal:", error);
	}
}

export function removerModalDespesa(id_html) {
	const container = document.getElementById(id_html);
	if (!container) {
		console.error(`Elemento com id "${id_html}" não encontrado.`);
		return;
	}

	const modal = container.querySelector("#modal-despesa");
	if (modal) {
		container.removeChild(modal);
	} else {
		console.warn(
			`Modal com id "modal-despesa" não encontrado em "${id_html}".`
		);
	}
}

async function carregarSelectsModalDespesa() {
	const categorias = await window.api.invoke("get-categoria-despesa");
	const formaPagamento = await window.api.invoke("get-forma-pagamento");
	const tipoPagamento = await window.api.invoke("get-tipo-pagamento");
	const statusDespesa = await window.api.invoke("get-status-despesa");

	const selectCategoriaModal = new SelectInterativo(
		document.getElementById("categoria")
	);
	selectCategoriaModal.load(categorias, "id", "categoria", true, "Categorias");

	const selectFormaPagamentoModal = new SelectInterativo(
		document.getElementById("forma_pagamento")
	);
	selectFormaPagamentoModal.load(
		formaPagamento,
		"id",
		"forma_pagamento",
		true,
		"Formas de pagamento"
	);

	const selectTipoPagamentoModal = new SelectInterativo(
		document.getElementById("tipo_pagamento")
	);
	selectTipoPagamentoModal.load(
		tipoPagamento,
		"id",
		"tipo_pagamento",
		true,
		"Tipo de pagamento"
	);

	const selectStatusDespesaModal = new SelectInterativo(
		document.getElementById("status_despesa")
	);

	selectStatusDespesaModal.load(
		statusDespesa,
		"id",
		"status_despesa",
		true,
		"Status despesa"
	);
}

export async function preencherFormularioDespesa(id) {
	const formDespesa = document.getElementById("form-despesa");
	const btnSaveDespesa = document.getElementById("btn-save-modal-despesa");
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
		// Submeter formulário
		formDespesa.addEventListener("submit", async (event) => {
			event.preventDefault();
			const formData = new FormData(formDespesa);
			const despesaData = Object.fromEntries(formData.entries());
			try {
				if (formDespesa.dataset.editingId) {
					despesaData.id = formDespesa.dataset.editingId;
					await window.api.invoke("despesa:update", despesaData);
					delete formDespesa.dataset.editingId;
				} else {
					await window.api.invoke("despesa:insert", despesaData);
				}
				formDespesa.reset();
				removerModalDespesa("despesas");
				// Disparar evento customizado para atualizar tabela
				window.dispatchEvent(new CustomEvent("atualizarTabelaDespesas"));
			} catch (error) {
				console.error("Erro ao salvar despesa:", error);
			}
		});
	} catch (error) {
		console.error("Erro ao carregar despesa para edição:", error);
	}
}
