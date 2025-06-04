// Importações de classes e funções auxiliares
import TabelaInterativa from "../models/TabelaInterativa.js"; // Classe para manipulação dinâmica de tabelas
import SelectInterativo from "../models/SelectInterativo.js"; // Classe para manipulação dinâmica de selects
import {
    loadModalDespesa, // Função que carrega o modal para adicionar/editar uma despesa
    preencherFormularioDespesa, // Função para preencher o formulário de despesas
} from "./modal-despesas.js";
import { formatarDataParaBR, formatarMoedaBR } from "../utils/formaters.js"; // Funções utilitárias para formatar data e moeda
import { mostrarConfirmacao, mostrarMensagem } from "../utils/mensagens.js"; // Funções para exibir mensagens ao usuário

// Variáveis globais de controle de estado
let tabela, tabelaPagamentosInterativa; // Instâncias de TabelaInterativa para a tabela principal e de despesas
let tabelaColNameClick = ""; // Nome da coluna clicada para alternar a ordenação
let id_funcionario; // ID do funcionário atualmente selecionado
let statusFuncionario, sexo, vinculo; // Dados para popular selects dinâmicos

// Função para carregar os selects do filtro de funcionários
async function carregarSelects() {
    // Busca dados do backend via API
    sexo = await window.api.invoke("get-sexo");
    vinculo = await window.api.invoke("get-vinculo-funcionario");
    statusFuncionario = await window.api.invoke("get-status-funcionario");

    // Carrega o select do filtro de status
    const selectStatusFilterObj = new SelectInterativo(
        document.getElementById("status_funcionario-filter")
    );
    selectStatusFilterObj.load(
        statusFuncionario,
        "id",
        "status_funcionario",
        true,
        "Status"
    );
}

// Função para carregar os selects do modal de funcionário
async function carregarSelectsModal() {
    const sexoModal = new SelectInterativo(
        document.getElementById("sexo-modal-funcionario")
    );
    const statusModal = new SelectInterativo(
        document.getElementById("status-modal-funcionario")
    );
    const vinculoModal = new SelectInterativo(
        document.getElementById("vinculo-modal-funcionario")
    );

    sexoModal.load(sexo, "id", "sexo", true, "Sexo");
    statusModal.load(
        statusFuncionario,
        "id",
        "status_funcionario",
        true,
        "Status"
    );
    vinculoModal.load(vinculo, "id", "vinculo_funcionario", true, "Vinculo");
}

// Função para abrir o modal de cadastro/edição de funcionário
function openModalFuncionario() {
    carregarSelectsModal(); // Carrega os dados dos selects
    document.getElementById("imagem-funcionario").src =
        "../src/public/img/person.png";
    document.getElementById("funcionario-modal").style.display = "flex";
}

// Função para fechar o modal e limpar o formulário
function closeModalFuncionario() {
    const formFuncionario = document.getElementById("form-funcionario");
    delete formFuncionario.dataset.editingId; // Remove atributo que indica edição
    formFuncionario.reset(); // Limpa o formulário
    document.getElementById("imagem-funcionario").src =
        "../src/public/img/person.png";
    document.getElementById("funcionario-modal").style.display = "none";
}

// Função para carregar funcionários aplicando filtros e ordenação
async function carregarFuncionarios(orderBy = {}) {
    const filters = {
        nome: document.getElementById("nome-filter").value || undefined,
        contato: document.getElementById("contato-filter").value || undefined,
        status_funcionario:
            document.getElementById("status_funcionario-filter").value ||
            undefined,
    };
    const funcionarios = await window.api.invoke(
        "get-funcionarios:filter",
        filters,
        orderBy
    );
    const colunasCustom = {
        id: "ID",
        nome: "Nome",
        contato: "Contato",
        status_funcionario: "Status",
    };
    tabela.load(funcionarios, colunasCustom); // Carrega a tabela com os dados e colunas personalizadas
}

// Função para carregar pagamentos vinculados a um funcionário
async function carregarPagamentosFuncionario(id = null) {
    const tabelaDespesaFuncionario =
        document.getElementById("table-funcionario");
    if (!tabelaDespesaFuncionario) return;
    tabelaPagamentosInterativa = new TabelaInterativa(tabelaDespesaFuncionario);
    const pagamentos = id
        ? await window.api.invoke(
              "despesa-funcionario:get-all-on-funcionario",
              id
          )
        : [];
    const pagamentosFormatados = pagamentos.map((p) => ({
        ...p,
        data: formatarDataParaBR(p.data),
        valor: formatarMoedaBR(p.valor),
    }));
    tabelaPagamentosInterativa.load(pagamentosFormatados, {
        id: "ID",
        descricao: "Descrição",
        categoria: "Categoria",
        valor: "Valor (R$)",
        data: "Data",
        status_despesa: "Status",
    });
}

// Preenche o formulário do modal com dados de um funcionário específico para edição
async function preencherFormularioFuncionario(id) {
    try {
        const funcionario = await window.api.invoke("funcionario:get", id);
        const form = document.getElementById("form-funcionario");
        for (const [key, value] of Object.entries(funcionario)) {
            if (form.elements[key]) form.elements[key].value = value;
        }
        form.dataset.editingId = id;
        document.getElementById("imagem-funcionario").src = funcionario.imagem
            ? `../${funcionario.imagem}?t=${Date.now()}`
            : "../src/public/img/person.png";
    } catch (error) {
        console.error("Erro ao carregar funcionario:", error);
    }
}

// Função principal para inicializar e gerenciar a tela de funcionários
export async function openFuncionarios() {
    // Inicializa a tabela principal
    tabela = new TabelaInterativa(
        document.getElementById("table-funcionarios")
    );

    // Configura a ordenação da tabela ao clicar nos cabeçalhos
    tabela.setOnColunaClick(async (nomeColuna, indiceColuna) => {
        const orderBy = {
            order: nomeColuna === tabelaColNameClick ? "DESC" : "ASC",
        };
        tabelaColNameClick =
            nomeColuna === tabelaColNameClick ? "" : nomeColuna;
        orderBy.name =
            nomeColuna === "status_funcionario"
                ? `sf.${nomeColuna}`
                : `f.${nomeColuna}`;
        await carregarFuncionarios(orderBy);
    });

    // Configura eventos dos filtros e botões
    const selectStatusFilter = document.getElementById(
        "status_funcionario-filter"
    );
    const selectStatusFilterObj = new SelectInterativo(selectStatusFilter);

    document
        .getElementById("update")
        .addEventListener("click", carregarFuncionarios);

    document.getElementById("export").addEventListener("click", async () => {
        const response = await window.api.invoke(
            "export:excel",
            tabela.data,
            "relatorio_funcionarios.xlsx"
        );

        if (response.success) {
            mostrarMensagem("Relatório gerado e aberto com sucesso.");
        } else {
            if (response.error.includes("Feche o arquivo")) {
                mostrarMensagem(
                    "Erro: o arquivo já está aberto. Feche o Excel e tente novamente."
                );
            } else {
                mostrarMensagem("Erro ao exportar: " + response.error);
            }
        }
    });

    document
        .getElementById("search")
        .addEventListener("click", carregarFuncionarios);

    document.getElementById("clear-filters").addEventListener("click", () => {
        ["nome-filter", "contato-filter"].forEach(
            (id) => (document.getElementById(id).value = "")
        );
        selectStatusFilter.value = "";
        carregarFuncionarios();
    });
    ["nome-filter", "contato-filter"].forEach((id) =>
        document
            .getElementById(id)
            .addEventListener("input", carregarFuncionarios)
    );
    selectStatusFilter.addEventListener("change", carregarFuncionarios);

    await carregarSelects(); // Carrega dados dos selects
    carregarFuncionarios(); // Carrega tabela inicial

    // CRUD de funcionários
    document.getElementById("add").addEventListener("click", () => {
        openModalFuncionario();
        carregarPagamentosFuncionario();
    });
    document.getElementById("edit").addEventListener("click", () => {
        const id = tabela.getSelectedRowId();
        if (id) {
            preencherFormularioFuncionario(id);
            carregarPagamentosFuncionario(id);
            openModalFuncionario();
            id_funcionario = id;
        } else mostrarMensagem("Selecione um funcionario para editar.");
    });
    document.getElementById("delete").addEventListener("click", async () => {
        const id = tabela.getSelectedRowId();
        if (!id)
            return mostrarMensagem("Selecione um funcionario para excluir.");
        const confirmado = await mostrarConfirmacao("Excluir funcionario?");
        if (id && confirmado) {
            await window.api.invoke("funcionario:delete", id);
            id_funcionario = null;
            carregarFuncionarios();
        }
    });

    // Botões para imagem do funcionário
    const imgFuncionario = document.getElementById("imagem-funcionario");
    document
        .getElementById("add-imagem")
        .addEventListener("click", async () => {
            const imgPath = await window.api.invoke("funcionario:get-image");
            if (imgPath) imgFuncionario.src = imgPath;
        });
    document.getElementById("delete-imagem").addEventListener("click", () => {
        imgFuncionario.src = "./public/img/person.png";
    });

    // Botão para fechar o modal
    document
        .getElementById("close-modal-funcionario")
        .addEventListener("click", () => {
            closeModalFuncionario();
            id_funcionario = null;
        });
    window.addEventListener(
        "click",
        (e) =>
            e.target === document.getElementById("funcionario-modal") &&
            closeModalFuncionario()
    );

    // Submissão do formulário (inserção ou atualização)
    document
        .getElementById("form-funcionario")
        .addEventListener("submit", async (e) => {
            e.preventDefault();
            const form = e.target;
            const data = Object.fromEntries(new FormData(form).entries());
            data.imagem = imgFuncionario.src;
            try {
                if (form.dataset.editingId) {
                    data.id = form.dataset.editingId;
                    await window.api.invoke("funcionario:update", data);
                    delete form.dataset.editingId;
                } else {
                    id_funcionario = await window.api.invoke(
                        "funcionario:insert",
                        data
                    );
                }
                carregarFuncionarios();
                closeModalFuncionario();
                carregarPagamentosFuncionario(id_funcionario);
            } catch (error) {
                console.error("Erro ao salvar funcionario:", error);
            }
        });

    // CRUD de pagamentos (despesas) do funcionário
    document
        .getElementById("add-despesa-funcionario")
        .addEventListener("click", () => {
            if (id_funcionario)
                loadModalDespesa("funcionarios", id_funcionario);
            else
                mostrarMensagem(
                    "Salve o funcionário antes de adicionar um pagamento."
                );
        });
    document
        .getElementById("edit-despesa-funcionario")
        .addEventListener("click", async () => {
            if (id_funcionario) {
                const idSelecionado =
                    tabelaPagamentosInterativa.getSelectedRowId();
                if (idSelecionado) {
                    await loadModalDespesa("funcionarios", id_funcionario);
                    preencherFormularioDespesa(idSelecionado);
                } else mostrarMensagem("Selecione uma despesa para editar.");
            } else
                mostrarMensagem(
                    "Salve o funcionário antes de editar um pagamento."
                );
        });
    document
        .getElementById("delete-despesa-funcionario")
        .addEventListener("click", async () => {
            if (id_funcionario) {
                const idSelecionado =
                    tabelaPagamentosInterativa.getSelectedRowId();
                if (idSelecionado) {
                    const confirmado = await mostrarConfirmacao(
                        "Excluir pagamento?"
                    );
                    if (confirmado) {
                        await window.api.invoke(
                            "despesa:delete",
                            idSelecionado
                        );
                        carregarPagamentosFuncionario(id_funcionario);
                    }
                } else mostrarMensagem("Selecione um pagamento para excluir.");
            } else
                mostrarMensagem(
                    "Salve o funcionário antes de remover um pagamento."
                );
        });

    // Atualiza automaticamente a tabela de pagamentos quando necessário
    window.addEventListener("atualizarTabelaDespesas", () => {
        if (id_funcionario) carregarPagamentosFuncionario(id_funcionario);
    });
}
