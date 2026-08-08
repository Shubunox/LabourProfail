/**
 * Biometric — Device API Adapter
 * ------------------------------------------------------------------
 * This is the ONLY module that should ever be called for hardware
 * I/O. Every function returns a Promise and mirrors what a real
 * device gateway would expose. In LIVE DEVICE MODE (deviceConfig
 * .isGatewayConfigured() === true) calls are forwarded to the
 * configured gateway over HTTP. In DEVELOPMENT MODE (no gateway
 * configured) calls resolve with clearly-tagged simulated data so the
 * rest of the application can be built and tested honestly — nothing
 * here is ever presented as a real hardware event.
 * ------------------------------------------------------------------
 */
import { deviceConfig } from './device-config.js';

async function gatewayRequest(path, options={}){
  if(!deviceConfig.isGatewayConfigured()){
    throw new Error('DEVICE_GATEWAY_NOT_CONFIGURED');
  }
  const res = await fetch(`${deviceConfig.gatewayBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type':'application/json',
      ...(deviceConfig.gatewayAuthHeader ? { Authorization: deviceConfig.gatewayAuthHeader } : {}),
      ...(options.headers||{}),
    },
  });
  if(!res.ok) throw new Error(`GATEWAY_ERROR_${res.status}`);
  return res.json();
}

function simulate(payload, delay=500){
  return new Promise(resolve=> setTimeout(()=> resolve({ ...payload, _simulated:true }), delay));
}

export const deviceApi = {
  mode(){ return deviceConfig.isGatewayConfigured() ? 'LIVE':'DEVELOPMENT'; },

  async connectDevice(device){
    if(deviceConfig.isGatewayConfigured()){
      return gatewayRequest(`/devices/${device.id}/connect`, { method:'POST' });
    }
    return simulate({ deviceId:device.id, status:'CONNECTED' }, 900);
  },

  async disconnectDevice(device){
    if(deviceConfig.isGatewayConfigured()){
      return gatewayRequest(`/devices/${device.id}/disconnect`, { method:'POST' });
    }
    return simulate({ deviceId:device.id, status:'DISCONNECTED' }, 400);
  },

  async getDeviceStatus(device){
    if(deviceConfig.isGatewayConfigured()){
      return gatewayRequest(`/devices/${device.id}/status`);
    }
    return simulate({ deviceId:device.id, status:device.connectionStatus, deviceTime:new Date().toISOString() });
  },

  async getDeviceInfo(device){
    if(deviceConfig.isGatewayConfigured()){
      return gatewayRequest(`/devices/${device.id}/info`);
    }
    return simulate({ deviceId:device.id, firmware:device.firmware, model:device.model, serial:device.serial });
  },

  async syncUsers(device){
    if(deviceConfig.isGatewayConfigured()){
      return gatewayRequest(`/devices/${device.id}/users/sync`, { method:'POST' });
    }
    return simulate({ deviceId:device.id, usersSynced:device.registeredUsers }, 1200);
  },

  async pushUser(device, staff){
    if(deviceConfig.isGatewayConfigured()){
      return gatewayRequest(`/devices/${device.id}/users`, { method:'POST', body:JSON.stringify({ staffId: staff.id, biometricId: staff.biometricId }) });
    }
    return simulate({ deviceId:device.id, staffId:staff.id, enrolled:true }, 1000);
  },

  async removeUser(device, staff){
    if(deviceConfig.isGatewayConfigured()){
      return gatewayRequest(`/devices/${device.id}/users/${staff.biometricId}`, { method:'DELETE' });
    }
    return simulate({ deviceId:device.id, staffId:staff.id, removed:true }, 500);
  },

  async getAttendanceLogs(device, since){
    if(deviceConfig.isGatewayConfigured()){
      return gatewayRequest(`/devices/${device.id}/attendance-logs?since=${encodeURIComponent(since||'')}`);
    }
    return simulate({ deviceId:device.id, logs:[] });
  },

  async syncAttendance(device){
    if(deviceConfig.isGatewayConfigured()){
      return gatewayRequest(`/devices/${device.id}/attendance/sync`, { method:'POST' });
    }
    return simulate({ deviceId:device.id, synced:0 }, 900);
  },
};
