const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const PostgresAuthRepository = require('../repositories/postgres/authRepository');

const authRepository = new PostgresAuthRepository();
const JWT_SECRET = process.env.JWT_SECRET || 'seu_secret_key_aqui';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

function isStringNaoVazia(valor) {
    return typeof valor === 'string' && valor.trim() !== '';
}

function validarUsername(username) {
    if (!username) {
        throw new Error('Campo username é obrigatório');
    }

    if (!isStringNaoVazia(username)) {
        throw new Error('Campo username deve ser uma string não vazia');
    }
}

function validarPassword(password) {
    if (!password) {
        throw new Error('Campo password é obrigatório');
    }

    if (!isStringNaoVazia(password)) {
        throw new Error('Campo password deve ser uma string não vazia');
    }

    if (password.length < 6) {
        throw new Error('Campo password deve ter pelo menos 6 caracteres');
    }
}

function gerarToken(usuario) {
    return jwt.sign(
        { id: usuario.id, username: usuario.username },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

async function login(username, password) {
    validarUsername(username);
    validarPassword(password);

    const usuario = await authRepository.buscarUsuarioPorUsername(username);

    if (!usuario) {
        throw new Error('Dados de login inválidos');
    }

    const senhaValida = await bcrypt.compare(password, usuario.password);

    if (!senhaValida) {
        throw new Error('Dados de login inválidos');
    }

    const token = gerarToken(usuario);

    return {
        mensagem: 'Login realizado com sucesso',
        token: token,
        usuario: {
            id: usuario.id,
            username: usuario.username
        }
    };
}

async function registrar(username, password) {
    validarUsername(username);
    validarPassword(password);

    const usuarioExistente = await authRepository.buscarUsuarioPorUsername(username);

    if (usuarioExistente) {
        throw new Error('Username já está em uso');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const novoUsuario = await authRepository.criarUsuario(username, passwordHash);

    const token = gerarToken(novoUsuario);

    return {
        token: token,
        usuario: {
            id: novoUsuario.id,
            username: novoUsuario.username
        }
    };
}

function verificarToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (erro) {
        throw new Error('Token inválido ou expirado');
    }
}

module.exports = { login, registrar, verificarToken };
