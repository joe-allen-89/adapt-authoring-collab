import AbstractApiModule from 'adapt-authoring-api';
import { WebSocketServer } from 'ws';

// https://www.npmjs.com/package/express-ws

export default class TemplateModule extends AbstractApiModule {
  /** @override */
  async init() {
    this.sockets = [];

    const [auth, server, ui] = await this.app.waitForModule('auth', 'server', 'ui');

    const router = server.api.createChildRouter('ws');
    router.addRoute({ route: '/data', handlers: { get: this.getData.bind(this) } });
    auth.secureRoute(`${router.path}/data`, 'GET', ['read:config']);

    ui.addUiPlugin(`${this.rootDir}/ui-plugin`);

    server.listeningHook.tap(() => {
      var wss = new WebSocketServer({ server: server.httpServer, path: "/socket" });
      wss.on("connection", this.onConnection.bind(this));

      setInterval(() => this.send('just testing ' + Date.now()), 3000)
    });
  }

  async getData(req, res, next) {
    res.json({ testing: true });
  }

  async send(data) {
    this.sockets.forEach(s => s.send(data));
  }

  async onConnection(ws) {
    console.log('new ws connection');
    ws.on('message', this.onMessage.bind(this));
    this.sockets.push(ws);
  }
  
  async onMessage({ data }) {
    console.log('ws message', data);
  }
}
