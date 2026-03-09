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

  async listarTodosPedidos() {
    throw new Error('Método listarTodosPedidos deve ser implementado');
  }

  async atualizarPedido(numeroPedido, dadosPedido) {
    throw new Error('Método atualizarPedido deve ser implementado');
  }

  async atualizarItems(numeroPedido, items) {
    throw new Error('Método atualizarItems deve ser implementado');
  }

  async deletarPedido(numeroPedido) {
    throw new Error('Método deletarPedido deve ser implementado');
  }
}

module.exports = OrderRepositoryInterface;
