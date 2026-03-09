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

    async listarTodosPedidos() {
        const cliente = await pool.connect();

        try {
            const queryPedidos = `
                SELECT "orderId", value, "creationDate"
                FROM "Order"
                ORDER BY "creationDate" DESC
            `;

            const resultadoPedidos = await cliente.query(queryPedidos);

            if (resultadoPedidos.rows.length === 0) {
                return [];
            }

            const pedidos = await Promise.all(
                resultadoPedidos.rows.map(async (pedido) => {
                    const queryItems = `
                        SELECT "productId", quantity, price
                        FROM "Items"
                        WHERE "orderId" = $1
                    `;

                    const resultadoItems = await cliente.query(queryItems, [pedido.orderId]);

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
                })
            );

            return pedidos;

        } catch (erro) {
            throw erro;
        } finally {
            cliente.release();
        }
    }

    async atualizarPedido(numeroPedido, dadosPedido) {
        const cliente = await pool.connect();

        try {
            await cliente.query('BEGIN');

            const campos = [];
            const valores = [];
            let contador = 1;

            if (dadosPedido.valorTotal !== undefined) {
                campos.push(`value = $${contador}`);
                valores.push(dadosPedido.valorTotal);
                contador++;
            }

            if (dadosPedido.dataCriacao !== undefined) {
                campos.push(`"creationDate" = $${contador}`);
                valores.push(dadosPedido.dataCriacao);
                contador++;
            }

            if (campos.length === 0) {
                await cliente.query('ROLLBACK');
                return { sucesso: true, numeroPedido: numeroPedido };
            }

            valores.push(numeroPedido);

            const queryAtualizarPedido = `
                UPDATE "Order"
                SET ${campos.join(', ')}
                WHERE "orderId" = $${contador}
            `;

            const resultado = await cliente.query(queryAtualizarPedido, valores);

            if (resultado.rowCount === 0) {
                await cliente.query('ROLLBACK');
                return null;
            }

            await cliente.query('COMMIT');
            return {
                sucesso: true,
                numeroPedido: numeroPedido
            };

        } catch (erro) {
            await cliente.query('ROLLBACK');
            throw erro;
        } finally {
            cliente.release();
        }
    }

    async atualizarItems(numeroPedido, items) {
        const cliente = await pool.connect();

        try {
            await cliente.query('BEGIN');

            await cliente.query('DELETE FROM "Items" WHERE "orderId" = $1', [numeroPedido]);

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

    async deletarPedido(numeroPedido) {
        const cliente = await pool.connect();

        try {
            await cliente.query('BEGIN');

            const queryDeletarPedido = `
                DELETE FROM "Order"
                WHERE "orderId" = $1
            `;

            const resultado = await cliente.query(queryDeletarPedido, [numeroPedido]);

            if (resultado.rowCount === 0) {
                await cliente.query('ROLLBACK');
                return null;
            }

            await cliente.query('COMMIT');
            return {
                sucesso: true,
                numeroPedido: numeroPedido
            };

        } catch (erro) {
            await cliente.query('ROLLBACK');
            throw erro;
        } finally {
            cliente.release();
        }
    }
}

module.exports = PostgresOrderRepository;
