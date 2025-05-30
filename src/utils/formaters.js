// src/utils/formatadores.js
export function formatarMoedaBR(valor) {
    if (typeof valor !== "number") return valor; // Retorna o valor original se não for número
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(valor);
}

export function formatarDataParaBR(dataISO) {
    if (!dataISO) return "";
    if (dataISO.includes("/")) return dataISO; // Já no formato BR
    const [ano, mes, dia] = dataISO.substring(0, 10).split("-");
    return `${dia}/${mes}/${ano}`;
}

export function converterDataParaISO(dataBR) {
    if (!dataBR) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(dataBR)) return dataBR;
    const [dia, mes, ano] = dataBR.split("/");
    if (!dia || !mes || !ano) return "";
    return `${ano.padStart(4, "0")}-${mes.padStart(2, "0")}-${dia.padStart(
        2,
        "0"
    )}`;
}
