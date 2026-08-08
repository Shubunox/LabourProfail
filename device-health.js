/**
 * Biometric — Device Health
 * ------------------------------------------------------------------
 * Aggregates device connection health for the global system status
 * indicator and the Biometric Devices module. In LIVE mode this
 * would poll deviceApi.getDeviceStatus() per device on an interval
 * (see deviceConfig.healthPollMs) or subscribe to gateway push
 * events; in DEVELOPMENT mode it reflects the mock store state.
 * ------------------------------------------------------------------
 */
import { deviceApi } from './device-api.js';
import { deviceConfig } from './device-config.js';

export const deviceHealth = {
  summarize(devices){
    const total = devices.length;
    const connected = devices.filter(d=> d.connectionStatus === 'CONNECTED').length;
    const errored = devices.filter(d=> d.connectionStatus === 'ERROR').length;
    const offline = devices.filter(d=> d.connectionStatus === 'DISCONNECTED').length;
    const health = total===0 ? 'NOT_CONFIGURED' : errored>0 ? 'DEGRADED' : offline>0 ? 'PARTIAL' : 'HEALTHY';
    return { total, connected, errored, offline, health };
  },

  async pollOnce(device){
    try{
      const status = await deviceApi.getDeviceStatus(device);
      return { deviceId:device.id, ok:true, status };
    }catch(err){
      return { deviceId:device.id, ok:false, error: err.message };
    }
  },

  startPolling(devices, onTick){
    const timer = setInterval(async ()=>{
      const results = await Promise.all(devices.map(d=> this.pollOnce(d)));
      onTick(results);
    }, deviceConfig.healthPollMs);
    return ()=> clearInterval(timer);
  },
};
