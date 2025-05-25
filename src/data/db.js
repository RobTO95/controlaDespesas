const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

// Garante que a pasta existe
const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
	fs.mkdirSync(dbDir, { recursive: true });
}

// Caminho completo do arquivo do banco
const dbPath = path.join(dbDir, "data.db");

// Conecta ao banco (cria se não existir)
const db = new Database(dbPath);

// Ativando chave estrangeira
db.pragma("foreign_keys = ON");

// Criação de tabelas

// -------------------------- criação da tabCategoria
db.prepare(
	`CREATE TABLE IF NOT EXISTS tabCategoria (
        id INTEGER PRIMARY KEY AUTOINCREMENT,  
        categoria TEXT NOT NULL
        )
        `
).run();

// -------------------------- criação da tabFormaPagamento
db.prepare(
	`CREATE TABLE IF NOT EXISTS tabFormaPagamento (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        forma_pagamento TEXT NOT NULL
        )
        `
).run();

// -------------------------- criação da tabSexo
db.prepare(
	`CREATE TABLE IF NOT EXISTS tabSexo (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        sexo TEXT NOT NULL
        )
        `
).run();

// -------------------------- criação da tabStatusDespesa
db.prepare(
	`CREATE TABLE IF NOT EXISTS tabStatusDespesa (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        status_despesa TEXT NOT NULL
        )
        `
).run();

// -------------------------- criação da tabStatusFuncionario
db.prepare(
	`CREATE TABLE IF NOT EXISTS tabStatusFuncionario (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        status_funcionario TEXT NOT NULL
        )
        `
).run();

// -------------------------- criação da tabTipoPagamento
db.prepare(
	`CREATE TABLE IF NOT EXISTS tabTipoPagamento (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        tipo_pagamento TEXT NOT NULL
        )
        `
).run();

// -------------------------- criação da tabVinculoFuncionario
db.prepare(
	`CREATE TABLE IF NOT EXISTS tabVinculoFuncionario (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        vinculo_funcionario TEXT NOT NULL
        )
        `
).run();

// -------------------------- criação da tabDespesas
db.prepare(
	`CREATE TABLE IF NOT EXISTS tabDespesas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        descricao TEXT, 
        categoria INTEGER NOT NULL, 
        valor REAL, 
        data TEXT NOT NULL, 
        forma_pagamento INTEGER NOT NULL, 
        tipo_pagamento INTEGER NOT NULL, 
        status_despesa INTEGER NOT NULL, 
        observacao TEXT 
        )
        `
).run();

// -------------------------- criação da tabFuncionarios
db.prepare(
	`CREATE TABLE IF NOT EXISTS tabFuncionarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL, 
        sexo INTEGER NOT NULL, 
        cpf TEXT, 
        data_nascimento TEXT NOT NULL, 
        contato TEXT, 
        endereco TEXT, 
        cep TEXT, 
        email TEXT, 
        status_funcionario INTEGER NOT NULL, 
        banco TEXT, 
        agencia TEXT, 
        conta TEXT, 
        imagem TEXT, 
        vinculo INTEGER NOT NULL
        )
        `
).run();

// -------------------------- criação da tabDespesasFuncionarios
db.prepare(
	`CREATE TABLE IF NOT EXISTS tabDespesasFuncionarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_funcionario INTEGER NOT NULL, 
        id_despesa INTEGER NOT NULL, 
        FOREIGN KEY (id_funcionario) REFERENCES tabFuncionarios(id) ON DELETE CASCADE,
        FOREIGN KEY (id_despesa) REFERENCES tabDespesas(id) ON DELETE CASCADE
        )
        `
).run();

module.exports = db;
console.log("Banco criado com sucesso!");
