// Importa módulos nativos do Node.js
const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");
const https = require("https");
const http = require("http");

// Importa o módulo externo 'uuid' para gerar identificadores únicos
const { v4: uuidv4 } = require("uuid");

/**
 * Copia uma imagem (de um caminho local, URL, ou file://) para a pasta do app,
 * com o nome sendo o ID da pessoa e mantendo a extensão original.
 * @param {string} sourcePath - Caminho da imagem (pode ser local, file:// ou http(s))
 * @param {string|number} personId - Identificador da pessoa (será o nome do arquivo)
 * @returns {Promise<string>} - Caminho final da imagem copiada
 */
async function copyImageToAppFolder(sourcePath, personId) {
    // Monta o caminho absoluto da pasta de destino
    const destDirPath = ["src", "public", "img", "funcionarios"];
    const destDir = path.join(__dirname, "..", "..", ...destDirPath);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    // Normaliza o caminho (resolve URLs, file:// e espaços)
    const localSourcePath = await normalizeFilePath(sourcePath);

    // Monta o caminho do destino com a extensão original
    const ext = await path.extname(localSourcePath);
    const name = `${personId}${ext}`;
    const destPath = path.join(destDir, name);

    // Copia o arquivo para o destino
    fs.copyFileSync(localSourcePath, destPath);

    return `${destDirPath.join("/")}/${name}`;
}

/**
 * Deleta uma imagem (de um caminho .../src/public/img/funcionarios), com o nome sendo o ID da pessoa.
 * @param {string|number} personId - Identificador da pessoa (será o nome do arquivo)
 */
function deleteImageOnAppFolder(personId) {
    // Monta o caminho absoluto da pasta de destino
    const destDirPath = ["src", "public", "img", "funcionarios"];
    const destDir = path.join(__dirname, "..", "..", ...destDirPath);
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    // Remove imagem antiga da pessoa (se houver)
    deleteImageForPerson(destDir, personId);
}

/**
 * Exclui a imagem existente de uma pessoa, se houver, na pasta de destino.
 * @param {string} destDir - Caminho absoluto da pasta de destino
 * @param {string|number} personId - Identificador da pessoa
 */
function deleteImageForPerson(destDir, personId) {
    if (!fs.existsSync(destDir)) return; // Nenhuma imagem salva ainda

    // Regex para identificar arquivos da pessoa com qualquer extensão
    const pattern = new RegExp(`^${personId}\\..*$`);
    fs.readdirSync(destDir).forEach((file) => {
        if (pattern.test(file)) {
            fs.unlinkSync(path.join(destDir, file)); // Remove o arquivo
        }
    });
}

/**
 * Normaliza o caminho da imagem, tratando:
 * - URLs HTTP/HTTPS (faz download automático)
 * - Caminhos file:// (converte para caminho local)
 * - Espaços codificados (%20 -> " ")
 * @param {string} sourcePath - Caminho original
 * @returns {Promise<string>} - Caminho local final (resolvido como Promise)
 */
function normalizeFilePath(sourcePath) {
    if (sourcePath.startsWith("http://") || sourcePath.startsWith("https://")) {
        return downloadFileFromUrl(sourcePath); // Faz download e resolve caminho
    }

    let localPath = sourcePath;
    if (sourcePath.startsWith("file://")) {
        localPath = fileURLToPath(sourcePath); // Converte file:// para caminho local
    }

    localPath = localPath.replace(/%20/g, " "); // Substitui espaços codificados
    return Promise.resolve(localPath); // Mantém consistência de Promise
}

/**
 * Faz o download de um arquivo a partir de uma URL HTTP/HTTPS e salva localmente.
 * @param {string} url - URL do arquivo a ser baixado
 * @returns {Promise<string>} - Caminho local do arquivo baixado
 */
function downloadFileFromUrl(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith("https") ? https : http;
        const ext = path.extname(new URL(url).pathname) || ".tmp"; // Mantém a extensão original ou usa .tmp
        const tempDir = path.join(__dirname, "..", "public", "temp_downloads");

        // Cria a pasta temp_downloads se não existir
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const filename = `${uuidv4()}${ext}`; // Nome único com extensão
        const filePath = path.join(tempDir, filename);
        const file = fs.createWriteStream(filePath);

        protocol
            .get(url, (response) => {
                if (response.statusCode !== 200) {
                    reject(
                        new Error(
                            `Erro ao baixar arquivo: ${response.statusCode}`
                        )
                    );
                    return;
                }
                response.pipe(file);
                file.on("finish", () => {
                    file.close(() => resolve(filePath)); // Resolve com o caminho final
                });
            })
            .on("error", (err) => {
                fs.unlink(filePath, () => {}); // Remove o arquivo incompleto
                reject(err);
            });
    });
}

// Exporta as funções para uso em outros módulos
module.exports = {
    copyImageToAppFolder,
    deleteImageOnAppFolder,
};
