const Conexao = require("./Conexao.js");

class Despesa {
	constructor(id = null) {
		this.id = id;
		this.descricao = "";
		this.categoria = null;
		this.valor = 0;
		this.data = "";
		this.forma_pagamento = null;
		this.tipo_pagamento = null;
		this.status_despesa = null;
		this.observacao = "";
		this.db = new Conexao().conn;
	}

	// Busca uma despesa pelo ID e preenche os dados do objeto
	getDados() {
		const row = this.db
			.prepare(`SELECT * FROM tabDespesas WHERE id = ?`)
			.get(this.id);
		if (row) {
			Object.assign(this, row);
		} else {
			throw new Error("Despesa não encontrada");
		}
	}

	// Insere nova despesa no banco
	insert() {
		const stmt = this.db.prepare(`
			INSERT INTO tabDespesas 
			(descricao, categoria, valor, data, forma_pagamento, tipo_pagamento, status_despesa, observacao) 
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		`);
		const result = stmt.run(
			this.descricao,
			this.categoria,
			this.valor,
			this.data,
			this.forma_pagamento,
			this.tipo_pagamento,
			this.status_despesa,
			this.observacao
		);
		this.id = result.lastInsertRowid;
	}

	// Atualiza os dados da despesa no banco
	update() {
		if (!this.id) throw new Error("ID não definido para atualização.");
		this.db
			.prepare(
				`
			UPDATE tabDespesas SET 
				descricao = ?, 
				categoria = ?, 
				valor = ?, 
				data = ?, 
				forma_pagamento = ?, 
				tipo_pagamento = ?, 
				status_despesa = ?, 
				observacao = ?
			WHERE id = ?
		`
			)
			.run(
				this.descricao,
				this.categoria,
				this.valor,
				this.data,
				this.forma_pagamento,
				this.tipo_pagamento,
				this.status_despesa,
				this.observacao,
				this.id
			);
	}

	// Remove a despesa do banco
	delete() {
		if (!this.id) throw new Error("ID não definido para exclusão.");
		this.db.prepare(`DELETE FROM tabDespesas WHERE id = ?`).run(this.id);
	}

	// Retorna todas as despesas (static para não depender de instância)
	static getAll() {
		const db = new Conexao().conn;
		return db.prepare(`SELECT * FROM tabDespesas ORDER BY data DESC`).all();
	}

	static getConexao() {
		return new Conexao().conn;
	}
}

module.exports = { Despesa };
