const OrderRepositoryInterface = require('../contratos/orderRepositoryInterface');
const pool = require('../../database/config');

class PostgresOrderRepository extends OrderRepositoryInterface {
    async inserirPedido(dadosPedido) {
        const cliente = await pool.connect();

        try {
            await cliente.query('BEGIN');

            const queryInserirPedido = `
        INSERT INTO "Order" ("orderId", value, "creationDate")
        VALUES ($1, $2, $3)
      `;

            await cliente.query(queryInserirPedido, [
                dadosPedido.numeroPedido,
                dadosPedido.valorTotal,
                dadosPedido.dataCriacao
            ]);

            await cliente.query('COMMIT');
            return {
                sucesso: true,
                numeroPedido: dadosPedido.numeroPedido
            };

        } catch (erro) {
            await cliente.query('ROLLBACK');
            throw erro;
        } finally {
            cliente.release();
        }
    }

    async inserirItems(numeroPedido, items) {
        const cliente = await pool.connect();

        try {
            await cliente.query('BEGIN');

            const queryInserirItems = `
        INSERT INTO "Items" ("orderId", "productId", quantity, price)
        VALUES ($1, $2, $3, $4)
      `;

            for (const item of items) {
                await cliente.query(queryInserirItems, [
                    numeroPedido,
                    item.idItem,
                    item.quantidadeItem,
                    item.valorItem
                ]);
            }

            await cliente.query('COMMIT');
            return { sucesso: true };

        } catch (erro) {
            await cliente.query('ROLLBACK');
            throw erro;
        } finally {
            cliente.release();
        }
    }

    async buscarPedidoPorNumero(numeroPedido) {
        const cliente = await pool.connect();

        try {
            const queryPedido = `
                SELECT "orderId", value, "creationDate"
                FROM "Order"
                WHERE "orderId" = $1
            `;

            const resultadoPedido = await cliente.query(queryPedido, [numeroPedido]);

            if (resultadoPedido.rows.length === 0) {
                return null;
            }

            const queryItems = `
                SELECT "productId", quantity, price
                FROM "Items"
                WHERE "orderId" = $1
            `;

            const resultadoItems = await cliente.query(queryItems, [numeroPedido]);

            const pedido = resultadoPedido.rows[0];
            const items = resultadoItems.rows.map(item => ({
                idItem: item.productId,
                quantidadeItem: item.quantity,
                valorItem: parseFloat(item.price)
            }));

            return {
                numeroPedido: pedido.orderId,
                valorTotal: parseFloat(pedido.value),
                dataCriacao: pedido.creationDate.toISOString(),
                items: items
            };

        } catch (erro) {
            throw erro;
        } finally {
            cliente.release();
        }
    }
}

module.exports = PostgresOrderRepository;
