/**
 * Classe para manipulação de elementos <select> com dados dinâmicos.
 */
export default class SelectInterativo {
	/** @type {HTMLSelectElement} */
	select;

	/** @type {Object[]} */
	data;

	/**
	 * @param {HTMLSelectElement} select - Elemento select HTML.
	 */
	constructor(select) {
		if (!(select instanceof HTMLSelectElement)) {
			throw new Error("Elemento fornecido não é um select HTML.");
		}
		this.select = select;
	}

	/**
	 * Carrega dados no select a partir de um array de objetos.
	 * @param {Object[]} dados - Lista de objetos para popular o select.
	 * @param {string} valueField - Nome do campo que será o value da option.
	 * @param {string} textField - Nome do campo que será o texto da option.
	 * @param {boolean} includeEmpty - Se true, inclui uma opção vazia no início.
	 */
	load(
		dados,
		valueField,
		textField,
		includeEmpty = true,
		textEmpty = "Selecione..."
	) {
		if (!Array.isArray(dados) || dados.length === 0) {
			this.clear();
			this.select.innerHTML = "<option>Nenhum dado disponível</option>";
			return;
		}

		// Limpa conteúdo atual
		this.clear();
		this.data = dados;

		// Inclui uma opção vazia se solicitado
		if (includeEmpty) {
			const emptyOption = document.createElement("option");
			emptyOption.value = "";
			emptyOption.textContent = textEmpty;
			this.select.appendChild(emptyOption);
		}

		// Popula as opções do select
		dados.forEach((item) => {
			const option = document.createElement("option");
			option.value = item[valueField];
			option.textContent = item[textField];
			this.select.appendChild(option);
		});
	}

	/**
	 * Limpa todas as opções do select.
	 */
	clear() {
		this.select.innerHTML = "";
		this.data = null;
	}

	/**
	 * Retorna o valor selecionado.
	 * @returns {string|null}
	 */
	getValue() {
		return this.select.value;
	}

	/**
	 * Define o valor selecionado.
	 * @param {string} value
	 */
	setValue(value) {
		this.select.value = value;
	}
}
