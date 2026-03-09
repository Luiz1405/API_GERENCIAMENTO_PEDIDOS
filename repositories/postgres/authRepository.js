const pool = require('../../database/config');

class PostgresAuthRepository {
    async buscarUsuarioPorUsername(username) {
        const cliente = await pool.connect();

        try {
            const query = `
                SELECT id, username, password
                FROM "Users"
                WHERE username = $1
            `;

            const resultado = await cliente.query(query, [username]);

            if (resultado.rows.length === 0) {
                return null;
            }

            return {
                id: resultado.rows[0].id,
                username: resultado.rows[0].username,
                password: resultado.rows[0].password
            };

        } catch (erro) {
            throw erro;
        } finally {
            cliente.release();
        }
    }

    async criarUsuario(username, passwordHash) {
        const cliente = await pool.connect();

        try {
            await cliente.query('BEGIN');

            const query = `
                INSERT INTO "Users" (username, password)
                VALUES ($1, $2)
                RETURNING id, username
            `;

            const resultado = await cliente.query(query, [username, passwordHash]);

            await cliente.query('COMMIT');

            return {
                id: resultado.rows[0].id,
                username: resultado.rows[0].username
            };

        } catch (erro) {
            await cliente.query('ROLLBACK');
            throw erro;
        } finally {
            cliente.release();
        }
    }
}

module.exports = PostgresAuthRepository;
