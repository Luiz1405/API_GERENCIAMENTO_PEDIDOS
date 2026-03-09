function extrairNumeroPedidoDaUrl(url) {
    const match = url.match(/^\/order\/(.+)$/);
    return match ? match[1] : null;
}

function isRotaGetPedido(url) {
    return /^\/order\/.+$/.test(url);
}

function isRotaPostPedido(url) {
    return url === '/order';
}

module.exports = {
    extrairNumeroPedidoDaUrl,
    isRotaGetPedido,
    isRotaPostPedido
};
