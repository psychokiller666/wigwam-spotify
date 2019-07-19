import Vue from 'vue'
import VueSimpleWebSocket from './simpleWebSocket'

Vue.use(VueSimpleWebSocket, 'ws://localhost:4000/websocket', {
  reconnectEnabled: true,
  reconnectInterval: 5000,
  autoConnect: false
})