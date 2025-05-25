const Conexao = require("./Conexao.js");

class Funcionario {
	constructor(id = null) {
		this.id = id;
		this.nome = "";
		this.sexo = null;
		this.cpf = "";
		this.data_nascimento = "";
		this.contato = "";
		this.endereco = "";
		this.cep = "";
		this.status_funcionario = null;
		this.vinculo = null;
		this.banco = "";
		this.agencia = "";
		this.conta = "";
		this.imagem = "";
		this.db = new Conexao().conn;
	}

	getDados() {
		const row = this.db
			.prepare(`SELECT * FROM tabFuncionario WHERE id = ?`)
			.get(this.id);
		if (row) {
			Object.assign(this, row);
		} else {
			throw new Error("Funcionário não encontrado");
		}
	}

	insert() {
		const stmt = this.db.prepare(`
			INSERT INTO tabFuncionario 
			(nome, sexo, cpf, data_nascimento, contato, endereco, cep, status_funcionario, vinculo, banco, agencia, conta, imagem) 
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`);
		const result = stmt.run(
			this.nome,
			this.sexo,
			this.cpf,
			this.data_nascimento,
			this.contato,
			this.endereco,
			this.cep,
			this.status_funcionario,
			this.vinculo,
			this.banco,
			this.agencia,
			this.conta,
			this.imagem
		);
		this.id = result.lastInsertRowid;
	}

	update() {
		if (!this.id) throw new Error("ID não definido para atualização.");
		this.db
			.prepare(
				`
			UPDATE tabFuncionario SET 
				nome = ?, 
				sexo = ?, 
				cpf = ?, 
				data_nascimento = ?, 
				contato = ?, 
				endereco = ?, 
				cep = ?, 
				status_funcionario = ?, 
				vinculo = ?, 
				banco = ?, 
				agencia = ?, 
				conta = ?, 
				imagem = ?
			WHERE id = ?
		`
			)
			.run(
				this.nome,
				this.sexo,
				this.cpf,
				this.data_nascimento,
				this.contato,
				this.endereco,
				this.cep,
				this.status_funcionario,
				this.vinculo,
				this.banco,
				this.agencia,
				this.conta,
				this.imagem,
				this.id
			);
	}

	delete() {
		if (!this.id) throw new Error("ID não definido para exclusão.");
		this.db.prepare(`DELETE FROM tabFuncionario WHERE id = ?`).run(this.id);
	}

	static getAll() {
		const db = new Conexao().conn;
		return db.prepare(`SELECT * FROM tabFuncionario ORDER BY nome`).all();
	}
}

module.exports = Funcionario;
