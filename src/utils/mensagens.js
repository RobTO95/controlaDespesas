export function mostrarMensagem(mensagem) {
	const overlay = document.createElement("div");
	overlay.className = "modal-mensagens-overlay";
	overlay.innerHTML = `
        <div class="modal-mensagens-content">
            <p>${mensagem}</p>
            <div class="modal-mensagens-buttons">
                <button id="btnOk">OK</button>
            </div>
        </div>
    `;
	document.body.appendChild(overlay);
	document.getElementById("btnOk").addEventListener("click", () => {
		document.body.removeChild(overlay);
	});
	window.addEventListener("click", (e) => {
		if (e.target === overlay) document.body.removeChild(overlay);
	});
}

export function mostrarConfirmacao(mensagem) {
	return new Promise((resolve) => {
		const overlay = document.createElement("div");
		overlay.className = "modal-mensagens-overlay";
		overlay.innerHTML = `
            <div class="modal-mensagens-content">
                <p>${mensagem}</p>
                <div class="modal-mensagens-buttons">
                    <button id="btnSim">Sim</button>
                    <button id="btnNao">Não</button>
                </div>
            </div>
        `;
		document.body.appendChild(overlay);
		document.getElementById("btnSim").addEventListener("click", () => {
			document.body.removeChild(overlay);
			resolve(true);
		});
		document.getElementById("btnNao").addEventListener("click", () => {
			document.body.removeChild(overlay);
			resolve(false);
		});
	});
}
