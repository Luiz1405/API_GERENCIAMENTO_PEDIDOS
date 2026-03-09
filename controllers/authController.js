const { login, registrar } = require('../services/authService');
const { validarContentType, validarBodyVazio, validarJSON, isErroValidacao } = require('../utils/requestValidator');
const { enviarRespostaErro, enviarRespostaDados } = require('../utils/responseHandler');

async function loginController(req, res) {
    const contentType = req.headers['content-type'];

    if (!validarContentType(contentType)) {
        enviarRespostaErro(res, 400, 'Content-Type deve ser application/json');
        return;
    }

    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        if (!validarBodyVazio(body)) {
            enviarRespostaErro(res, 400, 'Body da requisição não pode estar vazio');
            return;
        }

        const dados = validarJSON(body);
        if (!dados) {
            enviarRespostaErro(res, 400, 'JSON inválido no body da requisição');
            return;
        }

        try {
            const resultado = await login(dados.username, dados.password);
            enviarRespostaDados(res, resultado);
        } catch (erro) {
            console.error('Erro ao fazer login:', erro);

            if (erro.message === 'Dados de login inválidos') {
                enviarRespostaErro(res, 401, erro.message);
                return;
            }

            if (isErroValidacao(erro)) {
                enviarRespostaErro(res, 400, erro.message);
                return;
            }

            enviarRespostaErro(res, 500, 'Erro ao fazer login');
        }
    });

    req.on('error', (erro) => {
        console.error('Erro ao ler body:', erro);
        enviarRespostaErro(res, 400, 'Erro ao processar requisição');
    });
}

async function registrarController(req, res) {
    const contentType = req.headers['content-type'];

    if (!validarContentType(contentType)) {
        enviarRespostaErro(res, 400, 'Content-Type deve ser application/json');
        return;
    }

    let body = '';

    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        if (!validarBodyVazio(body)) {
            enviarRespostaErro(res, 400, 'Body da requisição não pode estar vazio');
            return;
        }

        const dados = validarJSON(body);
        if (!dados) {
            enviarRespostaErro(res, 400, 'JSON inválido no body da requisição');
            return;
        }

        try {
            const resultado = await registrar(dados.username, dados.password);
            enviarRespostaDados(res, resultado);
        } catch (erro) {
            console.error('Erro ao registrar:', erro);

            if (erro.message === 'Username já está em uso') {
                enviarRespostaErro(res, 409, erro.message);
                return;
            }

            if (isErroValidacao(erro)) {
                enviarRespostaErro(res, 400, erro.message);
                return;
            }

            enviarRespostaErro(res, 500, 'Erro ao registrar');
        }
    });

    req.on('error', (erro) => {
        console.error('Erro ao ler body:', erro);
        enviarRespostaErro(res, 400, 'Erro ao processar requisição');
    });
}

module.exports = { loginController, registrarController };
