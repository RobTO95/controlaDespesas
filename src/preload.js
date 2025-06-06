const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("api", {
    getDespesas: (orderBy) => ipcRenderer.invoke("get-despesas", orderBy),
    getCategoriasDespesas: () => ipcRenderer.invoke("get-categoria-despesa"),
    getFormaPagamento: () => ipcRenderer.invoke("get-forma-pagamento"),
    getTipoPagamento: () => ipcRenderer.invoke("get-tipo-pagamento"),
    getStatusDespesa: () => ipcRenderer.invoke("get-status-despesa"),
    getFuncionarios: () => ipcRenderer.invoke("get-funcionarios"),
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
    on: (channel, callback) => ipcRenderer.on(channel, callback),
});
