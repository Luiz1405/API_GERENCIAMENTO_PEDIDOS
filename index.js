require('dotenv').config();
const http = require('http');
const tratarRotaPedido = require('./routes/orderRoutes');
const inicializarBanco = require('./database/init');

const PORTA = process.env.PORT || 3000;

const servidor = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    tratarRotaPedido(req, res);
});

async function iniciarServidor() {
    try {
        await inicializarBanco();

        servidor.listen(PORTA, () => {
            console.log(`Servidor rodando na porta ${PORTA}`);
        });
    } catch (erro) {
        console.error('Erro ao iniciar servidor:', erro);
        process.exit(1);
    }
}

iniciarServidor();
