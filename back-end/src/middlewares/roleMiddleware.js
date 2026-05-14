/**
 * Middleware para verificar se o usuário possui um dos papéis (roles) permitidos.
 * @param {Array} permittedRoles - Array de strings com os papéis aceitos (ex: ['VARA'])
 */
const requireRole = (permittedRoles) => {
  return (req, res, next) => {
    // Verifica se o papel do usuário logado está dentro da lista de papéis permitidos
    if (!permittedRoles.includes(req.usuarioRole)) {
      return res.status(403).json({
        error: "Acesso negado: Você não tem permissão para realizar esta ação.",
      });
    }

    return next(); // Se tiver permissão, o fluxo continua!
  };
};

module.exports = requireRole;
