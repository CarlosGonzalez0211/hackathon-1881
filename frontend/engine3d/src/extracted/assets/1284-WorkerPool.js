/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 767449:768485.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1284(scope) {
scope.WorkerPool = class WorkerPool {
  constructor(e = 4) {
    this.pool = e, this.queue = [], this.workers = [], this.workersResolve = [], this.workerStatus = 0, this.workerCreator = null;
  }
  _initWorker(e) {
    if (!this.workers[e]) {
      const i = this.workerCreator();
      scope.__lifecycle.listen(i, "message", this._onMessage.bind(this, e)), this.workers[e] = i;
    }
  }
  _getIdleWorker() {
    for (let e = 0; e < this.pool; e++) if (!(this.workerStatus & 1 << e)) return e;
    return -1;
  }
  _onMessage(e, i) {
    const s = this.workersResolve[e];
    if (s && s(i), this.queue.length) {
      const {
        resolve: a,
        msg: o,
        transfer: l
      } = this.queue.shift();
      this.workersResolve[e] = a, this.workers[e].postMessage(o, l);
    } else this.workerStatus ^= 1 << e;
  }
  setWorkerCreator(e) {
    this.workerCreator = e;
  }
  setWorkerLimit(e) {
    this.pool = e;
  }
  postMessage(e, i) {
    return new Promise(s => {
      const a = this._getIdleWorker();
      a !== -1 ? (this._initWorker(a), this.workerStatus |= 1 << a, this.workersResolve[a] = s, this.workers[a].postMessage(e, i)) : this.queue.push({
        resolve: s,
        msg: e,
        transfer: i
      });
    });
  }
  dispose() {
    this.workers.forEach(e => e.terminate()), this.workersResolve.length = 0, this.workers.length = 0, this.queue.length = 0, this.workerStatus = 0;
  }
};
}
