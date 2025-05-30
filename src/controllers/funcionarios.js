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

    // imagem funcionario
    const imgFuncionario = document.getElementById("imagem-funcionario");
    imgFuncionario.addEventListener("dblclick", addImage);
    // <button id="add-imagem">Add</button>
    const btnAddImg = document.getElementById("add-imagem");
    btnAddImg.addEventListener("click", addImage);

    async function addImage() {
        const imgPath = await window.api.invoke("funcionario:get-image");
        imgFuncionario.src = imgPath ? imgPath : imgFuncionario.src;
    }

    // <button id="delete-imagem">Remove</button>
    const btnDeleteImg = document.getElementById("delete-imagem");
    btnDeleteImg.addEventListener("click", removeImage);
    function removeImage() {
        imgFuncionario.src = "./public/img/person.png";
    }

    const btnCloseModalFuncionario = document.getElementById(
        "close-modal-funcionario"
    );
    const selectSexoModal = document.getElementById("sexo-modal-funcionario");
    const selectStatusModal = document.getElementById(
        "status-modal-funcionario"
    );
    const selectVinculoModal = document.getElementById(
        "vinculo-modal-funcionario"
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

    formFuncionario.addEventListener("submit", salvarFuncionario);

    /* -------------------------- FUNÇÕES -------------------------- */
    async function salvarFuncionario(event) {
        event.preventDefault();
        const formData = new FormData(formFuncionario);
        const funcionarioData = Object.fromEntries(formData.entries());
        funcionarioData.imagem = imgFuncionario.src;
        try {
            if (formFuncionario.dataset.editingId) {
                funcionarioData.id = formFuncionario.dataset.editingId;
                await window.api.invoke("funcionario:update", funcionarioData);
                delete formFuncionario.dataset.editingId;
            } else {
                const id = await window.api.invoke(
                    "funcionario:insert",
                    funcionarioData
                );
            }
            await carregarFuncionarios();
            closeModalFuncionario();
            imgFuncionario.src = "./public/img/person.png";
            formFuncionario.reset();
        } catch (error) {
            console.error("Erro ao salvar funcionario:", error);
        }
    }

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
        const sexoModal = new SelectInterativo(selectSexoModal);
        const statusModal = new SelectInterativo(selectStatusModal);
        const vinculoModal = new SelectInterativo(selectVinculoModal);

        sexoModal.load(sexo, "id", "sexo", true, "Sexo");
        statusModal.load(
            statusFuncionario,
            "id",
            "status_funcionario",
            true,
            "Status"
        );
        vinculoModal.load(
            vinculo,
            "id",
            "vinculo_funcionario",
            true,
            "Vinculo"
        );
    }

    function openModalFuncionario() {
        carregarSelectsModal();
        imgFuncionario.src = "../src/public/img/person.png";
        modalFuncionario.style.display = "flex";
    }
    function closeModalFuncionario() {
        delete formFuncionario.dataset.editingId;
        formFuncionario.reset();
        imgFuncionario.src = "../src/public/img/person.png";
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
                ? `../${funcionario.imagem}?t=${Date.now()}`
                : "../src/public/img/person.png";
            formFuncionario.dataset.editingId = id;
        } catch (error) {
            console.error("Erro ao carregar funcionario para edição:", error);
        }
    }
}
