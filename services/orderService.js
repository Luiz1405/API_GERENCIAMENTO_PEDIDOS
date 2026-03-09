const orderRepository = require('../repositories/orderRepository');

function isStringNaoVazia(valor) {
    return typeof valor === 'string' && valor.trim() !== '';
}

function isNumero(valor) {
    return typeof valor === 'number' && !isNaN(valor);
}

function isNumeroPositivo(valor) {
    return isNumero(valor) && valor >= 0;
}

function isNumeroInteiroPositivo(valor) {
    return isNumero(valor) && Number.isInteger(valor) && valor >= 0;
}

function isDataValida(dataString) {
    if (typeof dataString !== 'string') {
        return false;
    }
    const data = new Date(dataString);
    return !isNaN(data.getTime());
}

function isArrayNaoVazio(valor) {
    return Array.isArray(valor) && valor.length > 0;
}

function isStringOuNumero(valor) {
    return typeof valor === 'string' || typeof valor === 'number';
}

function validarNumeroPedido(numeroPedido) {
    if (!numeroPedido) {
        throw new Error('Campo numeroPedido é obrigatório');
    }

    if (!isStringNaoVazia(numeroPedido)) {
        throw new Error('Campo numeroPedido deve ser uma string não vazia');
    }
}

function validarValorTotal(valorTotal) {
    if (valorTotal === undefined || valorTotal === null) {
        throw new Error('Campo valorTotal é obrigatório');
    }

    if (!isNumero(valorTotal)) {
        throw new Error('Campo valorTotal deve ser um número');
    }

    if (!isNumeroPositivo(valorTotal)) {
        throw new Error('Campo valorTotal não pode ser negativo');
    }
}

function validarDataCriacao(dataCriacao) {
    if (!dataCriacao) {
        throw new Error('Campo dataCriacao é obrigatório');
    }

    if (!isDataValida(dataCriacao)) {
        throw new Error('Campo dataCriacao deve ser uma data válida no formato ISO 8601');
    }
}

function validarItems(items) {
    if (!items || !Array.isArray(items)) {
        throw new Error('Campo items é obrigatório e deve ser um array');
    }

    if (!isArrayNaoVazio(items)) {
        throw new Error('Campo items deve conter pelo menos um item');
    }
}

function validarIdItem(idItem, indice) {
    if (!idItem) {
        throw new Error(`Campo idItem é obrigatório no item ${indice}`);
    }

    if (!isStringOuNumero(idItem)) {
        throw new Error(`Campo idItem no item ${indice} deve ser uma string ou número`);
    }
}

function validarQuantidadeItem(quantidadeItem, indice) {
    if (quantidadeItem === undefined || quantidadeItem === null) {
        throw new Error(`Campo quantidadeItem é obrigatório no item ${indice}`);
    }

    if (!isNumero(quantidadeItem)) {
        throw new Error(`Campo quantidadeItem no item ${indice} deve ser um número`);
    }

    if (!isNumeroInteiroPositivo(quantidadeItem)) {
        throw new Error(`Campo quantidadeItem no item ${indice} deve ser um número inteiro positivo`);
    }
}

function validarValorItem(valorItem, indice) {
    if (valorItem === undefined || valorItem === null) {
        throw new Error(`Campo valorItem é obrigatório no item ${indice}`);
    }

    if (!isNumero(valorItem)) {
        throw new Error(`Campo valorItem no item ${indice} deve ser um número`);
    }

    if (!isNumeroPositivo(valorItem)) {
        throw new Error(`Campo valorItem no item ${indice} não pode ser negativo`);
    }
}

function validarItem(item, indice) {
    validarIdItem(item.idItem, indice);
    validarQuantidadeItem(item.quantidadeItem, indice);
    validarValorItem(item.valorItem, indice);
}

function validarTodosItems(items) {
    items.forEach((item, index) => {
        const indice = index + 1;
        validarItem(item, indice);
    });
}

function validarDadosPedido(dadosPedido) {
    validarNumeroPedido(dadosPedido.numeroPedido);
    validarValorTotal(dadosPedido.valorTotal);
    validarDataCriacao(dadosPedido.dataCriacao);
    validarItems(dadosPedido.items);
    validarTodosItems(dadosPedido.items);
}

async function criarPedido(dadosPedido) {
    validarDadosPedido(dadosPedido);

    const resultadoPedido = await orderRepository.inserirPedido(dadosPedido);
    await orderRepository.inserirItems(dadosPedido.numeroPedido, dadosPedido.items);

    return {
        sucesso: true,
        numeroPedido: resultadoPedido.numeroPedido
    };
}

async function buscarPedidoPorNumero(numeroPedido) {
    validarNumeroPedido(numeroPedido);

    const pedido = await orderRepository.buscarPedidoPorNumero(numeroPedido);

    if (!pedido) {
        throw new Error('Pedido não encontrado');
    }

    return pedido;
}

module.exports = { criarPedido, buscarPedidoPorNumero };
