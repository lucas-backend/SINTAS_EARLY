export function createAttendanceController({ service }) {
  const run = (action) => async (req, res, next) => {
    try { res.json({ data: await action(req) }) } catch (error) { next(error) }
  }
  return {
    createSession: run((req) => service.createSession(req.user, req.body)),
    listSessions: run((req) => service.listSessions(req.user)),
    getQr: run((req) => service.getQr(req.user, Number(req.params.id))),
    scan: run((req) => service.scan(req.user, req.body)),
    history: run((req) => service.history(req.user, req.query)),
    classAttendance: run((req) => service.classAttendance(req.user, req.query, Number(req.params.id))),
    globalReport: run((req) => service.globalReport(req.user, req.query)),
  }
}