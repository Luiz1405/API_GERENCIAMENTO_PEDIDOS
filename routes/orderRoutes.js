const { criarPedidoController, buscarPedidoController, listarPedidosController, atualizarPedidoController, deletarPedidoController } = require('../controllers/orderController');
const { extrairNumeroPedidoDaUrl, isRotaGetPedido, isRotaPostPedido, isRotaListarPedidos, isRotaPutPedido, isRotaPatchPedido, isRotaDeletePedido } = require('../utils/urlParser');
const { enviarRespostaErro } = require('../utils/responseHandler');
const { autenticar } = require('../middleware/authMiddleware');

function tratarRotaPedido(req, res) {
    if (req.method === 'GET' && isRotaListarPedidos(req.url)) {
        listarPedidosController(req, res);
        return;
    }

    if (req.method === 'GET' && isRotaGetPedido(req.url)) {
        const numeroPedido = extrairNumeroPedidoDaUrl(req.url);

        if (!numeroPedido) {
            enviarRespostaErro(res, 400, 'Número do pedido não fornecido na URL');
            return;
        }

        buscarPedidoController(req, res, numeroPedido);
        return;
    }

    if (req.method === 'POST' && isRotaPostPedido(req.url)) {
        autenticar(req, res, () => {
            criarPedidoController(req, res);
        });
        return;
    }

    if ((req.method === 'PUT' || req.method === 'PATCH') && (isRotaPutPedido(req.url) || isRotaPatchPedido(req.url))) {
        const numeroPedido = extrairNumeroPedidoDaUrl(req.url);

        if (!numeroPedido) {
            enviarRespostaErro(res, 400, 'Número do pedido não fornecido na URL');
            return;
        }

        autenticar(req, res, () => {
            atualizarPedidoController(req, res, numeroPedido);
        });
        return;
    }

    if (req.method === 'DELETE' && isRotaDeletePedido(req.url)) {
        const numeroPedido = extrairNumeroPedidoDaUrl(req.url);

        if (!numeroPedido) {
            enviarRespostaErro(res, 400, 'Número do pedido não fornecido na URL');
            return;
        }

        autenticar(req, res, () => {
            deletarPedidoController(req, res, numeroPedido);
        });
        return;
    }

    enviarRespostaErro(res, 404, 'Rota não encontrada');
}

module.exports = tratarRotaPedido;
