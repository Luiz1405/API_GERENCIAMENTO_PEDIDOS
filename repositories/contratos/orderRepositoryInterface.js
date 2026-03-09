class OrderRepositoryInterface {
  async inserirPedido(dadosPedido) {
    throw new Error('Método inserirPedido deve ser implementado');
  }

  async inserirItems(numeroPedido, items) {
    throw new Error('Método inserirItems deve ser implementado');
  }

  async buscarPedidoPorNumero(numeroPedido) {
    throw new Error('Método buscarPedidoPorNumero deve ser implementado');
  }
}

module.exports = OrderRepositoryInterface;
