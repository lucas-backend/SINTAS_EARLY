export function createManagementController({ service }) {
  const run = (action) => async (req, res, next) => { try { res.json({ data: await action(req) }) } catch (error) { next(error) } }
  return {
    listUsers: run((req) => service.listUsers(req.user, req.query)),
    createUser: run((req) => service.createUser(req.user, req.body)),
    updateUser: run((req) => service.updateUser(req.user, Number(req.params.id), req.body)),
    deleteUser: run((req) => service.deleteUser(req.user, Number(req.params.id))),
    resetPassword: run((req) => service.resetPassword(req.user, Number(req.params.id), req.body)),
  }
}
