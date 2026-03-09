const { verificarToken } = require('../services/authService');
const { enviarRespostaErro } = require('../utils/responseHandler');

function extrairTokenDoHeader(req) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return null;
    }

    const partes = authHeader.split(' ');

    if (partes.length !== 2 || partes[0] !== 'Bearer') {
        return null;
    }

    return partes[1];
}

function autenticar(req, res, next) {
    const token = extrairTokenDoHeader(req);

    if (!token) {
        enviarRespostaErro(res, 401, 'Token de autenticação não fornecido');
        return;
    }

    try {
        const usuario = verificarToken(token);
        req.usuario = usuario;
        next();
    } catch (erro) {
        console.error('Erro ao verificar token:', erro);
        enviarRespostaErro(res, 401, 'Token inválido ou expirado');
    }
}

module.exports = { autenticar };
