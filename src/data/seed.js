const db = require("./db");

// Dados para seed
const categoria = [
	{ categoria: "Alimentação" },
	{ categoria: "Transporte" },
	{ categoria: "Moradia" },
	{ categoria: "Saúde" },
	{ categoria: "Educação" },
	{ categoria: "Lazer" },
	{ categoria: "Compras" },
	{ categoria: "Assinaturas e Serviços" },
	{ categoria: "Contas e Utilidades" },
	{ categoria: "Investimentos" },
	{ categoria: "Impostos e Taxas" },
	{ categoria: "Presentes e Doações" },
	{ categoria: "Animais de Estimação" },
	{ categoria: "Cuidados Pessoais" },
	{ categoria: "Despesas Emergenciais" },
	{ categoria: "Viagens" },
];

const formaPagamento = [
	{ forma_pagamento: "Dinheiro" },
	{ forma_pagamento: "Cartão" },
	{ forma_pagamento: "PIX" },
	{ forma_pagamento: "Boleto" },
];

const sexo = [{ sexo: "Feminino" }, { sexo: "Masculino" }];

const statusDespesa = [
	{ status_despesa: "Pago" },
	{ status_despesa: "Pendente" },
];

const statusFuncionario = [
	{ status_funcionario: "Ativo" },
	{ status_funcionario: "Inativo" },
];

const tipoPagamento = [
	{ tipo_pagamento: "à vista" },
	{ tipo_pagamento: "parcelado" },
];

const vinculoFuncionario = [
	{ vinculo_funcionario: "CLT" },
	{ vinculo_funcionario: "PJ" },
	{ vinculo_funcionario: "Prestador de serviço" },
	{ vinculo_funcionario: "Doméstico" },
	{ vinculo_funcionario: "Freelancer" },
];

// Função para inserir os dados se ainda não existirem
function seedTable(tableName, rows, keyColumn = "id") {
	const exists = db.prepare(`SELECT COUNT(*) as total FROM ${tableName}`).get();
	if (exists.total === 0) {
		const keys = Object.keys(rows[0]);
		const placeholders = keys.map((k) => `@${k}`).join(", ");
		const stmt = db.prepare(
			`INSERT INTO ${tableName} (${keys.join(", ")}) VALUES (${placeholders})`
		);

		const insertMany = db.transaction((rows) => {
			for (const row of rows) stmt.run(row);
		});

		insertMany(rows);
		console.log(`✅ ${tableName} populada com sucesso.`);
	} else {
		console.log(
			`ℹ️  ${tableName} já contém dados. Nenhuma inserção realizada.`
		);
	}
}

// Executa o seed
seedTable("tabCategoria", categoria);
seedTable("tabFormaPagamento", formaPagamento);
seedTable("tabSexo", sexo);
seedTable("tabStatusDespesa", statusDespesa);
seedTable("tabStatusFuncionario", statusFuncionario);
seedTable("tabTipoPagamento", tipoPagamento);
seedTable("tabVinculoFuncionario", vinculoFuncionario);

const despesas = [
	{
		descricao: "Compra supermercado",
		categoria: 1, // Alimentação
		valor: 250.5,
		data: "10/05/2025",
		forma_pagamento: 2, // Cartão
		tipo_pagamento: 1, // à vista
		status_despesa: 1, // Pago
		observacao: "Compras mensais de alimentos",
	},
	{
		descricao: "Passagem de ônibus",
		categoria: 2, // Transporte
		valor: 15.75,
		data: "11/05/2025",
		forma_pagamento: 1, // Dinheiro
		tipo_pagamento: 1,
		status_despesa: 2, // Pendente
		observacao: "Passe diário para o trabalho",
	},
	{
		descricao: "Aluguel apartamento",
		categoria: 3, // Moradia
		valor: 1200,
		data: "01/05/2025",
		forma_pagamento: 4, // Boleto
		tipo_pagamento: 1,
		status_despesa: 1,
		observacao: "Aluguel mensal",
	},
	{
		descricao: "Consulta médica",
		categoria: 4, // Saúde
		valor: 300,
		data: "20/04/2025",
		forma_pagamento: 3, // PIX
		tipo_pagamento: 1,
		status_despesa: 1,
		observacao: "Consulta com especialista",
	},
	{
		descricao: "Curso online",
		categoria: 6, // Educação
		valor: 400,
		data: "05/05/2025",
		forma_pagamento: 2,
		tipo_pagamento: 2, // parcelado
		status_despesa: 2,
		observacao: "Curso de programação",
	},
	{
		descricao: "Cinema com amigos",
		categoria: 7, // Lazer
		valor: 80,
		data: "15/05/2025",
		forma_pagamento: 1,
		tipo_pagamento: 1,
		status_despesa: 1,
		observacao: "Sessão de filme e pipoca",
	},
	{
		descricao: "Compra roupas",
		categoria: 8, // Compras
		valor: 350,
		data: "18/05/2025",
		forma_pagamento: 2,
		tipo_pagamento: 2,
		status_despesa: 2,
		observacao: "Renovação do guarda-roupa",
	},
	{
		descricao: "Assinatura streaming",
		categoria: 9, // Assinaturas e Serviços
		valor: 29.9,
		data: "01/05/2025",
		forma_pagamento: 2,
		tipo_pagamento: 1,
		status_despesa: 1,
		observacao: "Netflix mensal",
	},
	{
		descricao: "Conta de luz",
		categoria: 10, // Contas e Utilidades
		valor: 150,
		data: "10/05/2025",
		forma_pagamento: 4,
		tipo_pagamento: 1,
		status_despesa: 1,
		observacao: "Conta de energia elétrica",
	},
	{
		descricao: "Investimento em ações",
		categoria: 11, // Investimentos
		valor: 1000,
		data: "02/05/2025",
		forma_pagamento: 3,
		tipo_pagamento: 1,
		status_despesa: 1,
		observacao: "Compra de ações na bolsa",
	},
];

seedTable("tabDespesas", despesas);

const funcionarios = [
	{
		nome: "Robério Oliveira",
		sexo: 2,
		cpf: "99999999999",
		data_nascimento: "1995-03-09",
		contato: "99999999999",
		endereco: "Rua Elisa Wolkmann Maass, 380",
		cep: "99999999",
		email: "roberio.oliveira.trabalho@gmail.com",
		status_funcionario: 1,
		banco: "",
		agencia: "",
		conta: "",
		imagem: "",
		vinculo: 3, // Prestador de serviço
	},
	{
		nome: "Ana Carolina Silva",
		sexo: 1,
		cpf: "88888888888",
		data_nascimento: "1990-06-15",
		contato: "88888888888",
		endereco: "Avenida Paulista, 1000",
		cep: "01310000",
		email: "ana.silva@gmail.com",
		status_funcionario: 1,
		banco: "Banco do Brasil",
		agencia: "1234-5",
		conta: "987654-3",
		imagem: "",
		vinculo: 1, // CLT
	},
	{
		nome: "Carlos Eduardo Almeida",
		sexo: 2,
		cpf: "77777777777",
		data_nascimento: "1988-09-21",
		contato: "77777777777",
		endereco: "Rua das Palmeiras, 45",
		cep: "20040000",
		email: "carlos.almeida@empresa.com",
		status_funcionario: 1,
		banco: "Itaú",
		agencia: "4321-6",
		conta: "123456-7",
		imagem: "",
		vinculo: 2, // PJ
	},
	{
		nome: "Beatriz Santos",
		sexo: 1,
		cpf: "66666666666",
		data_nascimento: "1993-12-05",
		contato: "66666666666",
		endereco: "Rua das Flores, 230",
		cep: "04567000",
		email: "beatriz.santos@empresa.com",
		status_funcionario: 1,
		banco: "Bradesco",
		agencia: "7890-1",
		conta: "654321-9",
		imagem: "",
		vinculo: 1, // CLT
	},
	{
		nome: "Lucas Pereira",
		sexo: 2,
		cpf: "55555555555",
		data_nascimento: "1997-02-10",
		contato: "55555555555",
		endereco: "Rua do Sol, 789",
		cep: "30310000",
		email: "lucas.pereira@empresa.com",
		status_funcionario: 2, // Inativo
		banco: "Santander",
		agencia: "2345-8",
		conta: "765432-1",
		imagem: "",
		vinculo: 4, // Doméstico
	},
];

seedTable("tabFuncionarios", funcionarios);

console.log("Tabelas carregadas com sucesso!");
