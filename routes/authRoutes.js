const { loginController, registrarController } = require('../controllers/authController');
const { enviarRespostaErro } = require('../utils/responseHandler');

function tratarRotaAuth(req, res) {
    if (req.method === 'POST' && req.url === '/auth/login') {
        loginController(req, res);
        return;
    }

    if (req.method === 'POST' && req.url === '/auth/register') {
        registrarController(req, res);
        return;
    }

    enviarRespostaErro(res, 404, 'Rota não encontrada');
}

module.exports = tratarRotaAuth;
