export function createAttendanceController({ service }) {
  const run = (action) => async (req, res, next) => {
    try {
      res.json({ data: await action(req) });
    } catch (error) {
      next(error);
    }
  };
  const runFile = (action) => async (req, res, next) => {
    try {
      const file = await action(req);
      res
        .type(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        .set("Content-Disposition", `attachment; filename="${file.fileName}"`)
        .send(file.buffer);
    } catch (error) {
      next(error);
    }
  };
  return {
    createSession: run((req) => service.createSession(req.user, req.body)),
    listSessions: run((req) => service.listSessions(req.user)),
    updateSession: run((req) => service.updateSession(req.user, Number(req.params.id), req.body)),
    deleteSession: run((req) => service.deleteSession(req.user, Number(req.params.id))),
    getQr: run((req) => service.getQr(req.user, Number(req.params.id))),
    sessionRoster: run((req) =>
      service.sessionRoster(req.user, Number(req.params.id)),
    ),
    setStatusOverride: run((req) => service.setStatusOverride(req.user, req.body)),
    clearStatusOverride: run((req) =>
      service.clearStatusOverride(
        req.user,
        Number(req.params.sessionId),
        Number(req.params.studentId),
      ),
    ),
    dailyRecap: run((req) => service.dailyRecap(req.user, req.query)),
    recapSummary: run((req) => service.recapSummary(req.user, req.query)),
    todaySchedule: run((req) => service.todaySchedule(req.user)),
    scan: run((req) => service.scan(req.user, req.body)),
    history: run((req) => service.history(req.user, req.query)),
    classAttendance: run((req) =>
      service.classAttendance(req.user, req.query, Number(req.params.id)),
    ),
    globalReport: run((req) => service.globalReport(req.user, req.query)),
    exportReport: runFile((req) => service.exportReport(req.user, req.query)),
  };
}
