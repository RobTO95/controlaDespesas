export default class TabelaInterativa {
	table;
	data;
	selectedRowIndex = null;

	constructor(table) {
		if (!(table instanceof HTMLTableElement)) {
			throw new Error("Elemento fornecido não é uma tabela HTML.");
		}
		this.table = table;

		// 🎹 Ativar captura do teclado
		this.table.tabIndex = 0;
		this.table.addEventListener("keydown", (event) =>
			this.handleKeyDown(event)
		);
	}

	load(dados, colunasPersonalizadas = {}) {
		if (!Array.isArray(dados) || dados.length === 0) {
			this.clear();
			this.table.innerHTML =
				"<thead><tr><th>Nenhum dado encontrado</th></tr></thead>";
			return;
		}

		this.clear();
		this.data = dados;

		const colunas = Object.keys(this.data[0]);
		const thead = this.table.createTHead();
		const headRow = thead.insertRow();

		colunas.forEach((col) => {
			const th = document.createElement("th");
			th.textContent = colunasPersonalizadas[col] || col;
			headRow.appendChild(th);
		});

		const tbody = this.table.createTBody();

		this.data.forEach((obj, index) => {
			const row = tbody.insertRow();
			row.dataset.id = obj.id;
			row.dataset.index = index;

			colunas.forEach((col) => {
				const cell = row.insertCell();
				cell.textContent = obj[col] != null ? obj[col] : "";
			});

			// 🖱️ Clique para selecionar/deselecionar
			row.addEventListener("click", () => {
				if (row.classList.contains("selected")) {
					// Clique para desmarcar
					row.classList.remove("selected");
					this.selectedRowIndex = null;
				} else {
					// Clique para marcar
					this.clearSelection();
					row.classList.add("selected");
					this.selectedRowIndex = index;
				}
			});
		});
	}

	handleKeyDown(event) {
		const rows = Array.from(this.table.querySelectorAll("tbody tr"));
		if (rows.length === 0) return;

		if (event.key === "ArrowUp") {
			event.preventDefault();
			if (this.selectedRowIndex === null) {
				this.selectedRowIndex = 0;
			} else if (this.selectedRowIndex > 0) {
				this.selectedRowIndex--;
			}
			this.updateSelection(rows);
		} else if (event.key === "ArrowDown") {
			event.preventDefault();
			if (this.selectedRowIndex === null) {
				this.selectedRowIndex = 0;
			} else if (this.selectedRowIndex < rows.length - 1) {
				this.selectedRowIndex++;
			}
			this.updateSelection(rows);
		}
	}

	updateSelection(rows) {
		this.clearSelection();
		const row = rows[this.selectedRowIndex];
		row.classList.add("selected");
		row.scrollIntoView({ behavior: "smooth", block: "nearest" });
	}

	clear() {
		this.table.innerHTML = "";
		this.data = null;
		this.selectedRowIndex = null;
	}

	clearSelection() {
		const selectedRows = this.table.querySelectorAll("tr.selected");
		selectedRows.forEach((row) => row.classList.remove("selected"));
	}

	getSelectedRowId() {
		const selectedRow = this.table.querySelector("tr.selected");
		return selectedRow ? selectedRow.dataset.id : null;
	}
}
