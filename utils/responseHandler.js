function enviarRespostaErro(res, status, mensagem) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ erro: mensagem }));
}

function enviarRespostaSucesso(res, numeroPedido) {
    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        mensagem: 'Pedido criado com sucesso',
        numeroPedido: numeroPedido
    }));
}

function enviarRespostaDados(res, dados) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(dados));
}

module.exports = {
    enviarRespostaErro,
    enviarRespostaSucesso,
    enviarRespostaDados
};
