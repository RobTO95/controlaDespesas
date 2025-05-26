import TabelaInterativa from "../models/TabelaInterativa.js";
import SelectInterativo from "../models/SelectInterativo.js";

export async function openFuncionarios() {
    const btnUpdate = document.getElementById("update");
    btnUpdate.addEventListener("click", carregarFuncionarios);
    const btnAdd = document.getElementById("add");
    const btnEdit = document.getElementById("edit");
    const btnDelete = document.getElementById("delete");
    const tabela = new TabelaInterativa(
        document.getElementById("table-funcionarios")
    );

    async function carregarFuncionarios() {
        const funcionarios = await window.api.getFuncionarios();
        const colunasCustom = {
            nome: "Nome",
            contato: "Contato",
            status_funcionario: "Status",
        };
        tabela.load(funcionarios, colunasCustom);
    }

    carregarFuncionarios();

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
}
