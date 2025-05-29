import TabelaInterativa from "../models/TabelaInterativa.js";
import SelectInterativo from "../models/SelectInterativo.js";

export async function openFuncionarios() {
    /* -------------------------- 🏷️ Variáveis Globais -------------------------- */
    let funcionarioCurrent;

    // Dados dos selects
    let statusFuncionario;
    let sexo;
    let vinculo;
    const tabela = new TabelaInterativa(
        document.getElementById("table-funcionarios")
    );

    // Botões --------------------------------------------------------
    const btnUpdate = document.getElementById("update");
    const btnAdd = document.getElementById("add");
    const btnEdit = document.getElementById("edit");
    const btnDelete = document.getElementById("delete");
    const btnSearch = document.getElementById("search");
    const btnClear = document.getElementById("clear-filters");

    // Filtros -------------------------------------------------------
    const inputNomeFilter = document.getElementById("nome-filter");
    const inputContatoFilter = document.getElementById("contato-filter");

    const selectStatusFilter = document.getElementById(
        "status_funcionario-filter"
    );
    const selectStatusFilterObj = new SelectInterativo(selectStatusFilter);

    // Modal ---------------------------------------------------------
    const modalFuncionario = document.getElementById("funcionario-modal");
    const formFuncionario = document.getElementById("form-funcionario");
    const imgFuncionario = document.getElementById("imagem-funcionario");
    const btnCloseModalFuncionario = document.getElementById(
        "close-modal-funcionario"
    );

    /* -------------------------- EVENTOS -------------------------- */
    btnSearch.addEventListener("click", carregarFuncionarios);
    inputContatoFilter.addEventListener("input", carregarFuncionarios);
    inputNomeFilter.addEventListener("input", carregarFuncionarios);
    selectStatusFilter.addEventListener("change", carregarFuncionarios);
    btnClear.addEventListener("click", () => {
        inputNomeFilter.value = "";
        inputContatoFilter.value = "";
        selectStatusFilter.value = "";
        carregarFuncionarios();
    });

    btnUpdate.addEventListener("click", carregarFuncionarios);

    btnAdd.addEventListener("click", () => {
        openModalFuncionario();
    });

    btnEdit.addEventListener("click", () => {
        const idSelecionado = tabela.getSelectedRowId();

        if (!idSelecionado) {
            return alert("Selecione uma despesa para editar.");
        } else {
            preencherFormularioFuncionario(idSelecionado);
            openModalFuncionario();
        }
    });

    btnDelete.addEventListener("click", async () => {
        const idSelecionado = tabela.getSelectedRowId();
        if (!idSelecionado)
            return alert("Por favor, selecione um funcionario para excluir.");
        if (confirm("Tem certeza que deseja excluir este funcionario?")) {
            try {
                await window.api.invoke("funcionario:delete", idSelecionado);
                await carregarFuncionarios();
            } catch (error) {
                console.error("Erro ao excluir funcionario:", error);
            }
        }
    });
    // Eventos Modal -------------------------------------------------------
    btnCloseModalFuncionario.addEventListener("click", () => {
        closeModalFuncionario();
    });

    window.addEventListener("click", (e) => {
        if (e.target === modalFuncionario) closeModalFuncionario();
    });

    formFuncionario.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(formFuncionario);
        const funcionarioData = Object.fromEntries(formData.entries());
        try {
            if (formFuncionario.dataset.editingId) {
                funcionarioData.id = formFuncionario.dataset.editingId;
                await window.api.invoke("funcionario:update", funcionarioData);
                delete formFuncionario.dataset.editingId;
            } else {
                await window.api.invoke("funcionario:insert", funcionarioData);
            }
            await carregarFuncionarios();
            closeModalFuncionario();
            formFuncionario.reset();
        } catch (error) {
            console.error("Erro ao salvar funcionario:", error);
        }
    });

    /* -------------------------- FUNÇÕES -------------------------- */
    async function carregarSelects() {
        sexo = await window.api.invoke("get-sexo");
        vinculo = await window.api.invoke("get-vinculo-funcionario");
        statusFuncionario = await window.api.invoke("get-status-funcionario");
        selectStatusFilterObj.load(
            statusFuncionario,
            "id",
            "status_funcionario",
            true,
            "Status"
        );
    }
    carregarSelects();
    async function carregarSelectsModal() {
        // IMPLEMENTAR O CARREGAMENTO DOS SELECTS DO MODAL
    }

    function openModalFuncionario() {
        modalFuncionario.style.display = "flex";
    }
    function closeModalFuncionario() {
        modalFuncionario.style.display = "none";
    }

    async function carregarFuncionarios() {
        const filters = {};
        if (inputNomeFilter.value) {
            filters.nome = inputNomeFilter.value;
        }
        if (inputContatoFilter.value) {
            filters.contato = inputContatoFilter.value;
        }
        if (selectStatusFilter.value) {
            filters.status_funcionario = selectStatusFilter.value;
        }

        // const funcionarios = await window.api.getFuncionarios();
        const funcionarios = await window.api.invoke(
            "get-funcionarios:filter",
            filters
        );

        const colunasCustom = {
            id: "ID",
            nome: "Nome",
            contato: "Contato",
            status_funcionario: "Status",
        };
        tabela.load(funcionarios, colunasCustom);
    }
    carregarFuncionarios();

    async function preencherFormularioFuncionario(id) {
        try {
            const funcionario = await window.api.invoke("funcionario:get", id);
            funcionarioCurrent = funcionario;
            formFuncionario.elements["nome"].value = funcionario.nome;
            formFuncionario.elements["sexo"].value = funcionario.sexo;
            formFuncionario.elements["cpf"].value = funcionario.cpf;
            formFuncionario.elements["data_nascimento"].value =
                funcionario.data_nascimento;
            formFuncionario.elements["contato"].value = funcionario.contato;
            formFuncionario.elements["endereco"].value = funcionario.endereco;
            formFuncionario.elements["cep"].value = funcionario.cep;
            formFuncionario.elements["email"].value = funcionario.email;
            formFuncionario.elements["status_funcionario"].value =
                funcionario.status_funcionario;
            formFuncionario.elements["banco"].value = funcionario.banco;
            formFuncionario.elements["agencia"].value = funcionario.agencia;
            formFuncionario.elements["conta"].value = funcionario.conta;
            formFuncionario.elements["vinculo"].value = funcionario.vinculo;
            imgFuncionario.src = funcionario.imagem
                ? funcionario.imagem
                : "./public/img/person.png";
            formFuncionario.dataset.editingId = id;
        } catch (error) {
            console.error("Erro ao carregar funcionario para edição:", error);
        }
    }
}
