const { criarPedido, buscarPedidoPorNumero } = require('../services/orderService');
const { validarContentType, validarBodyVazio, validarJSON, isErroValidacao } = require('../utils/requestValidator');
const { enviarRespostaErro, enviarRespostaSucesso, enviarRespostaDados } = require('../utils/responseHandler');

async function criarPedidoController(req, res) {
    const contentType = req.headers['content-type'];

    if (!validarContentType(contentType)) {
        enviarRespostaErro(res, 400, 'Content-Type deve ser application/json');
        return;
    }

    let corpo = '';

    req.on('data', chunk => {
        corpo += chunk.toString();
    });

    req.on('end', async () => {
        if (!validarBodyVazio(corpo)) {
            enviarRespostaErro(res, 400, 'Body da requisição não pode estar vazio');
            return;
        }

        const dadosPedido = validarJSON(corpo);
        if (!dadosPedido) {
            enviarRespostaErro(res, 400, 'JSON inválido no body da requisição');
            return;
        }

        try {
            const resultado = await criarPedido(dadosPedido);
            enviarRespostaSucesso(res, resultado.numeroPedido);
        } catch (erro) {
            console.error('Erro ao criar pedido:', erro);

            if (isErroValidacao(erro)) {
                enviarRespostaErro(res, 400, erro.message);
                return;
            }

            enviarRespostaErro(res, 500, 'Erro ao criar pedido');
        }
    });

    req.on('error', (erro) => {
        console.error('Erro ao ler body:', erro);
        enviarRespostaErro(res, 400, 'Erro ao processar requisição');
    });
}

async function buscarPedidoController(req, res, numeroPedido) {
    try {
        const pedido = await buscarPedidoPorNumero(numeroPedido);
        enviarRespostaDados(res, pedido);
    } catch (erro) {
        console.error('Erro ao buscar pedido:', erro);

        if (erro.message === 'Pedido não encontrado') {
            enviarRespostaErro(res, 404, erro.message);
            return;
        }

        if (isErroValidacao(erro)) {
            enviarRespostaErro(res, 400, erro.message);
            return;
        }

        enviarRespostaErro(res, 500, 'Erro ao buscar pedido');
    }
}

module.exports = { criarPedidoController, buscarPedidoController };
