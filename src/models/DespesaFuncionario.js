// Importa a classe de conexão com o banco de dados
const Conexao = require("./Conexao.js");

/**
 * Classe DespesaFuncionario
 * Representa a relação entre despesas e funcionários no sistema.
 */
class DespesaFuncionario {
    /**
     * Construtor da classe DespesaFuncionario.
     * @param {number|null} id - Identificador da relação (opcional).
     * @param {number|null} idFuncionario - Identificador do funcionário (opcional).
     * @param {number|null} idDespesa - Identificador da despesa (opcional).
     */
    constructor(id = null, idFuncionario = null, idDespesa = null) {
        this.id = id;
        this.id_funcionario = idFuncionario;
        this.id_despesa = idDespesa;
        // Instancia a conexão com o banco de dados
        this.db = new Conexao().conn;
    }

    /**
     * Busca os dados da relação despesa-funcionário a partir do id.
     * Atualiza o objeto atual com os dados encontrados.
     * @throws {Error} Se o registro não for encontrado.
     * @returns {DespesaFuncionario} Retorna o próprio objeto atualizado.
     */
    getDados() {
        const query = `SELECT * FROM tabDespesasFuncionarios WHERE id=?`;
        const row = this.db.prepare(query).get(this.id);
        if (row) {
            Object.assign(this, row); // Atribui os valores retornados ao objeto
            return this;
        } else {
            throw new Error("Relação despesa x funcionario não encontrada");
        }
    }

    /**
     * Insere um novo registro na tabela `tabDespesasFuncionarios` usando os atributos id_funcionario e id_despesa.
     * Atualiza o atributo id com o valor do último registro inserido.
     */
    insert() {
        const query = `INSERT INTO tabDespesasFuncionarios (id_funcionario, id_despesa) VALUES(?, ?)`;
        const stmt = this.db.prepare(query);
        const result = stmt.run(this.id_funcionario, this.id_despesa);
        this.id = result.lastInsertRowid; // Atribui o ID do novo registro
    }

    /**
     * Atualiza um registro existente na tabela `tabDespesasFuncionarios` com base no id.
     * @throws {Error} Se o atributo id não estiver definido.
     */
    update() {
        if (!this.id) throw new Error("ID não definido para atualização.");
        const query = `UPDATE tabDespesasFuncionarios SET id_funcionario=?, id_despesa=? WHERE id=?`;
        this.db
            .prepare(query)
            .run(this.id_funcionario, this.id_despesa, this.id);
    }

    /**
     * Exclui o registro da tabela `tabDespesasFuncionarios` correspondente ao id.
     * @throws {Error} Se o atributo id não estiver definido.
     */
    delete() {
        if (!this.id) throw new Error("ID não definido para exclusão.");
        const query = `DELETE FROM tabDespesasFuncionarios WHERE id=?`;
        this.db.prepare(query).run(this.id);
    }

    /**
     * Busca os dados de despesas a partir do id_funcionario.
     * @returns {Array<Object>} Lista de todos os registros encontrados.
     */
    getDespesaForIdFuncionario() {
        if (!this.id_funcionario)
            throw new Error("ID funcionário não definido para busca.");

        const query = `
        SELECT 
            d.id, d.descricao, d.categoria, d.valor, d.data, d.status_despesa 
        FROM 
            tabDespesasFuncionarios AS df 
        INNER JOIN 
            tabDespesas AS d ON df.id_despesa = d.id
        WHERE 
            df.id_funcionario=?`;

        const result = this.db.prepare(query).all(this.id_funcionario);
        return result;
    }

    /**
     * Obtém uma nova conexão com o banco de dados.
     * @returns {Object} Conexão ativa com o banco de dados.
     */
    static getConexao() {
        return new Conexao().conn;
    }

    /**
     * Recupera todos os registros da tabela `tabDespesasFuncionarios`.
     * @returns {Array<Object>} Lista de todos os registros encontrados.
     */
    static getAll() {
        const db = new Conexao().conn;
        const query = `SELECT * FROM tabDespesasFuncionarios`;
        const result = db.prepare(query).all();
        return result;
    }
}

// Exporta a classe DespesaFuncionario para ser usada em outros módulos
module.exports = { DespesaFuncionario };
