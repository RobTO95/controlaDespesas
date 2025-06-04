const fs = require("fs");
const os = require("os");
const path = require("path");
const { shell } = require("electron");
const XLSX = require("xlsx");

async function exportToExcel(data = [], filename = "tabela.xlsx") {
    try {
        if (!data || data.length === 0) {
            return new Error("Nenhum dado para exportar.");
        }

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Tabela");

        const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
        const tempPath = path.join(os.tmpdir(), filename);

        // Tenta sobrescrever o arquivo (falha se estiver aberto)
        try {
            fs.writeFileSync(tempPath, buffer);
        } catch (writeErr) {
            if (writeErr.code === "EBUSY" || writeErr.code === "EPERM") {
                return new Error(
                    "O arquivo está aberto. Feche o arquivo e tente novamente."
                );
            }
            return writeErr;
        }

        const result = await shell.openPath(tempPath);
        if (result) {
            return new Error(`Erro ao abrir o arquivo: ${result}`);
        }

        return true;
    } catch (err) {
        return err;
    }
}

module.exports = {
    exportToExcel,
};
