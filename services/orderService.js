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
        throw new Error('Campo dataCriacao deve ser uma data válida ano/mes/dia');
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
    validarValorTotal(dadosPedido.valorTotal);
    validarDataCriacao(dadosPedido.dataCriacao);
    validarItems(dadosPedido.items);
    validarTodosItems(dadosPedido.items);
}

function validarValorTotalOpcional(valorTotal) {
    if (valorTotal === undefined || valorTotal === null) {
        return;
    }

    if (!isNumero(valorTotal)) {
        throw new Error('Campo valorTotal deve ser um número');
    }

    if (!isNumeroPositivo(valorTotal)) {
        throw new Error('Campo valorTotal não pode ser negativo');
    }
}

function validarDataCriacaoOpcional(dataCriacao) {
    if (!dataCriacao) {
        return;
    }

    if (!isDataValida(dataCriacao)) {
        throw new Error('Campo dataCriacao deve ser uma data válida no formato ano/mes/dia');
    }
}

function validarItemsOpcional(items) {
    if (items === undefined || items === null) {
        return;
    }

    if (!Array.isArray(items)) {
        throw new Error('Campo items deve ser um array');
    }

    if (items.length === 0) {
        throw new Error('Campo items deve conter pelo menos um item');
    }

    validarTodosItems(items);
}

function validarDadosPedidoParcial(dadosPedido) {
    validarValorTotalOpcional(dadosPedido.valorTotal);
    validarDataCriacaoOpcional(dadosPedido.dataCriacao);
    validarItemsOpcional(dadosPedido.items);
}

async function criarPedido(dadosPedido) {
    validarDadosPedido(dadosPedido);
    validarNumeroPedido(dadosPedido.numeroPedido);

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

async function listarTodosPedidos() {
    const pedidos = await orderRepository.listarTodosPedidos();
    return pedidos;
}

async function atualizarPedido(numeroPedido, dadosPedido) {
    validarNumeroPedido(numeroPedido);

    const pedidoExiste = await orderRepository.buscarPedidoPorNumero(numeroPedido);
    if (!pedidoExiste) {
        throw new Error('Pedido não encontrado');
    }

    validarDadosPedidoParcial(dadosPedido);

    const temCamposParaAtualizar = dadosPedido.valorTotal !== undefined ||
        dadosPedido.dataCriacao !== undefined ||
        dadosPedido.items !== undefined;

    if (!temCamposParaAtualizar) {
        throw new Error('É necessário enviar pelo menos um campo para atualizar');
    }

    if (dadosPedido.valorTotal !== undefined || dadosPedido.dataCriacao !== undefined) {
        const resultadoPedido = await orderRepository.atualizarPedido(numeroPedido, dadosPedido);
        if (!resultadoPedido) {
            throw new Error('Erro ao atualizar pedido');
        }
    }

    if (dadosPedido.items !== undefined) {
        await orderRepository.atualizarItems(numeroPedido, dadosPedido.items);
    }

    return {
        sucesso: true,
        numeroPedido: numeroPedido
    };
}

async function deletarPedido(numeroPedido) {
    validarNumeroPedido(numeroPedido);

    const pedidoExiste = await orderRepository.buscarPedidoPorNumero(numeroPedido);
    if (!pedidoExiste) {
        throw new Error('Pedido não encontrado');
    }

    const resultado = await orderRepository.deletarPedido(numeroPedido);

    if (!resultado) {
        throw new Error('Erro ao deletar pedido');
    }

    return {
        sucesso: true,
        numeroPedido: numeroPedido
    };
}

module.exports = { criarPedido, buscarPedidoPorNumero, listarTodosPedidos, atualizarPedido, deletarPedido };
