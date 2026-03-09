function extrairNumeroPedidoDaUrl(url) {
    if (url === '/order/list') {
        return null;
    }
    const match = url.match(/^\/order\/(.+)$/);
    return match ? match[1] : null;
}

function isRotaGetPedido(url) {
    return /^\/order\/.+$/.test(url) && url !== '/order/list';
}

function isRotaPostPedido(url) {
    return url === '/order';
}

function isRotaListarPedidos(url) {
    return url === '/order/list';
}

function isRotaPutPedido(url) {
    return /^\/order\/.+$/.test(url) && url !== '/order/list';
}

function isRotaPatchPedido(url) {
    return /^\/order\/.+$/.test(url) && url !== '/order/list';
}

function isRotaDeletePedido(url) {
    return /^\/order\/.+$/.test(url) && url !== '/order/list';
}

module.exports = {
    extrairNumeroPedidoDaUrl,
    isRotaGetPedido,
    isRotaPostPedido,
    isRotaListarPedidos,
    isRotaPutPedido,
    isRotaPatchPedido,
    isRotaDeletePedido
};
