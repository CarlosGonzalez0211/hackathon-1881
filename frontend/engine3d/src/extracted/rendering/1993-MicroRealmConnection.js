/* Extracted from references/messenger/dist/assets/App3D-DwM1eiaC.js; 1531645:1536694.
 * Original code by abeto and bundled library authors. See references/messenger. */
export function step1993(scope) {
scope.MicroRealmConnection = class MicroRealmConnection {
  constructor({
    servers: e = ["ws://localhost:3005"],
    roomPrefix: i = "default",
    roomRequested: s = "",
    data: a = {},
    dataTypes: o = {},
    updateRate: l = 35,
    pingRate: c = 20,
    clientsLimit: h = 1 / 0,
    autoConnect: d = !0,
    addClient: p = scope.noop,
    removeClient: f = scope.noop,
    removeAllClients: _ = scope.noop,
    onRoomJoined: x = scope.noop,
    onConnect: b = scope.noop,
    onData: T = scope.noop,
    onDisconnect: M = scope.noop
  } = {}) {
    this._socketCreated = !1, this._servers = typeof e == "string" ? [e] : e, this._serverFirstConnection = !0, this._serverIndex = 0, this._serverPing = 20, this._serverTimeDiff = 0, this._roomPrefix = i, this._roomRequested = s, this._updateRate = l, this._pingRate = c, this._data = a, this._prevData = JSON.stringify(this._data), this._protoMsg = scope.createMessage("RealmData", this._data, o), this._protoMsgFields = Object.keys(this._protoMsg.fields).length, this._clients = new Map(), this._clientsLimit = h, this._localID = null, this._localIDLength = 0, this._removeAllClients = _, this._addClient = p, this._removeClient = f, this._onRoomJoined = x, this._onConnect = b, this._onData = T, this._onDisconnect = M, this._connected = !1, this._boundOpen = this._open.bind(this), this._boundMessage = this._message.bind(this), this._boundClose = this._close.bind(this), this._boundPing = this._ping.bind(this), this._boundRelay = this._relay.bind(this), this._pingInterval = null, this._relayInterval = null, this._retryInterval = null, scope.events$1.on("microrealm_join_room", this._requestRoom, this), scope.events$1.on("visibility_change", this._forceConnectionState, this), d && this._createSocket();
  }
  _createSocket() {
    this._socket = new WebSocket(this._servers[this._serverIndex], "permessage-deflate"), this._socket.binaryType = "arraybuffer", this._socket.onopen = this._boundOpen, this._socket.onmessage = this._boundMessage, this._socket.onerror = this._boundClose, this._socket.onclose = this._boundClose, this._socketCreated = !0;
  }
  _forceConnectionState(e) {
    this._close(!1), this._socketCreated && e && this._createSocket();
  }
  _open() {
    this._serverFirstConnection = !1, this._connected = !0, this._onConnect();
  }
  _close(e) {
    this._socketCreated && (["onopen", "onmessage", "onclose", "onerror"].forEach(i => {
      this._socket[i] = null;
    }), scope.__lifecycle.clearInterval(this._pingInterval), scope.__lifecycle.clearInterval(this._relayInterval), scope.__lifecycle.clearInterval(this._retryInterval), this._socket.close(), this._connected && (this._connected = !1, this._onDisconnect(), scope.events$1.emit("microrealm_disconnected", this._roomRequested)), e !== !1 && (this._serverFirstConnection ? (this._serverIndex = (this._serverIndex + 1) % this._servers.length, this._retryInterval = scope.__lifecycle.setInterval(() => {
      scope.__lifecycle.clearInterval(this._retryInterval), this._createSocket();
    }, 1e3)) : this._retryInterval = scope.__lifecycle.setInterval(() => {
      Object.keys(this._retrieveChangedData()).length > 0 && (scope.__lifecycle.clearInterval(this._retryInterval), this._createSocket());
    }, 1e3)));
  }
  _message(e) {
    try {
      if (typeof e.data != "string") {
        const s = scope.decoder.decode(e.data.slice(0, this._localIDLength)),
          a = this._protoMsg.decode(new Uint8Array(e.data.slice(this._localIDLength))),
          o = Object.keys(a),
          l = this._clients.get(s);
        if (l) o.forEach(c => {
          a[c] instanceof Array && a[c].length === 0 || (l[c] = a[c]);
        });else {
          if (this._clients.size >= this._clientsLimit || (this._relay(!0), o.reduce((h, d) => a[d] instanceof Array && a[d].length === 0 ? h : h + 1, 0) !== this._protoMsgFields)) return;
          this._clients.set(s, a), this._addClient(s, a);
        }
        return;
      }
      const i = JSON.parse(e.data);
      if (i.PONG && typeof i.PONG == "number") {
        const s = Date.now();
        this._serverPing = Math.max(0, (s - i.PONG) * .5), this._serverTimeDiff = s - (i.t || s) - this._serverPing;
      } else if (i.id && typeof i.id == "string") this._localID = i.id, this._localIDLength = this._localID.length, this._requestRoom(this._roomRequested);else if (i.r && typeof i.r == "string") this._removeAllClients(), this._clients.clear(), this._roomRequested = i.r, scope.__lifecycle.clearInterval(this._pingInterval), this._pingInterval = scope.__lifecycle.setInterval(this._boundPing, this._pingRate * 1e3), scope.__lifecycle.clearInterval(this._relayInterval), this._relayInterval = scope.__lifecycle.setInterval(this._boundRelay, this._updateRate), this._ping(), this._relay(!0), this._onRoomJoined(this._roomRequested), scope.events$1.emit("microrealm_connected", this._roomRequested);else if (i.data) this._onData(i.data);else if (i.leave && typeof i.leave == "string") {
        if (!this._clients.has(i.leave)) return;
        this._clients.delete(i.leave), this._removeClient(i.leave);
      }
    } catch {}
  }
  _ping() {
    this._sendJson({
      ping: Date.now()
    });
  }
  _requestRoom(e = "") {
    this._roomRequested = e, this._sendJson({
      r: [this._roomPrefix, this._roomRequested]
    });
  }
  _retrieveChangedData() {
    const e = JSON.parse(this._prevData),
      i = {};
    return Object.keys(this._data).forEach(s => {
      JSON.stringify(e[s]) !== JSON.stringify(this._data[s]) && (i[s] = this._data[s]);
    }), i;
  }
  _relay(e = !1) {
    if (e) this._prevData = JSON.stringify(this._data), this._sendRelayedData(JSON.parse(this._prevData));else {
      const i = this._retrieveChangedData();
      if (Object.keys(i).length === 0) return;
      this._prevData = JSON.stringify(this._data), this._sendRelayedData(i);
    }
  }
  _sendJson(e) {
    this._connected && this._socket.send(JSON.stringify(e));
  }
  _sendRelayedData(e) {
    if (!this._connected) return;
    const i = this._protoMsg.verify(e);
    if (i) return console.warn("websocket data error", i);
    const s = this._protoMsg.create(e),
      a = this._protoMsg.encode(s).finish();
    this._socket.send(a);
  }
  dispose() {
    scope.events$1.off("microrealm_join_room", this._requestRoom, this), scope.events$1.off("visibility_change", this._forceConnectionState, this), this._close(!1);
  }
};
}
