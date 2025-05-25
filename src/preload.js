const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
	getDespesas: () => ipcRenderer.invoke("get-despesas"),
	getCategoriasDespesas: () => ipcRenderer.invoke("get-categoria-despesa"),
	getFormaPagamento: () => ipcRenderer.invoke("get-forma-pagamento"),
	getTipoPagamento: () => ipcRenderer.invoke("get-tipo-pagamento"),
	getStatusDespesa: () => ipcRenderer.invoke("get-status-despesa"),
	invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
	send: (channel, ...args) => ipcRenderer.send(channel, ...args),
	on: (channel, callback) => ipcRenderer.on(channel, callback),
});
