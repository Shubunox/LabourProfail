/**
 * Biometric — Device Manager
 * ------------------------------------------------------------------
 * Orchestrates device connection lifecycle and exposes a small
 * pub/sub surface so UI screens (Biometric Devices, Live Terminal,
 * Enrollment) can subscribe to state changes instead of polling.
 * Wraps device-api.js; never touches hardware directly.
 * ------------------------------------------------------------------
 */
import { deviceApi } from './device-api.js';

const listeners = new Map(); // event -> Set<fn>

function emit(event, payload){
  (listeners.get(event) || new Set()).forEach(fn=> fn(payload));
}

export const deviceManager = {
  on(event, fn){
    if(!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(fn);
    return ()=> listeners.get(event).delete(fn);
  },

  async connect(device){
    emit('device:state', { deviceId:device.id, state:'AUTHENTICATING' });
    try{
      await deviceApi.connectDevice(device);
      emit('device:state', { deviceId:device.id, state:'CONNECTED' });
      return true;
    }catch(err){
      emit('device:state', { deviceId:device.id, state:'ERROR', error: err.message });
      return false;
    }
  },

  async disconnect(device){
    await deviceApi.disconnectDevice(device);
    emit('device:state', { deviceId:device.id, state:'DISCONNECTED' });
  },

  async syncUsers(device){
    emit('device:state', { deviceId:device.id, state:'SYNCING' });
    const res = await deviceApi.syncUsers(device);
    emit('device:state', { deviceId:device.id, state:'CONNECTED' });
    return res;
  },

  /** Emits a fully-labeled simulated biometric event stream for DEVELOPMENT MODE only. */
  startSimulationStream(device, onEvent){
    const stages = ['AUTH_RECEIVED','IDENTITY_VERIFICATION','EMPLOYEE_IDENTIFIED','WAREHOUSE_VALIDATED','ATTENDANCE_LOGGED','DB_SYNCED'];
    let cancelled = false;
    const runOnce = async ()=>{
      for(const stage of stages){
        if(cancelled) return;
        await new Promise(r=> setTimeout(r, 380 + Math.random()*260));
        onEvent({ stage, deviceId:device.id, simulated:true, timestamp:new Date().toISOString() });
      }
    };
    const interval = setInterval(()=>{ if(!cancelled) runOnce(); }, 4200);
    runOnce();
    return ()=>{ cancelled = true; clearInterval(interval); };
  },
};
