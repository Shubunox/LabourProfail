/**
 * Biometric — Attendance Sync
 * ------------------------------------------------------------------
 * Bridges raw device attendance logs into LabourPro's attendance
 * processing pipeline (AttendanceEvent model). Runs the same
 * validation states described in the attendance engine spec:
 * RECEIVED -> VALIDATED -> PROCESSED -> EXCEPTION / REJECTED.
 * ------------------------------------------------------------------
 */
import { deviceApi } from './device-api.js';

export const attendanceSync = {
  async pullFromDevice(device, staffDirectory, warehouseId){
    const { logs=[] } = await deviceApi.getAttendanceLogs(device);
    return logs.map(log=> this.validate(log, staffDirectory, device, warehouseId));
  },

  /** Validates a raw punch against known staff/device/warehouse mappings. */
  validate(log, staffDirectory, device, warehouseId){
    const staff = staffDirectory.find(s=> s.biometricId === log.biometricId);
    if(!staff) return { ...log, processingState:'REJECTED', reason:'UNKNOWN_BIOMETRIC_ID' };
    if(staff.warehouseId !== warehouseId) return { ...log, processingState:'EXCEPTION', reason:'WAREHOUSE_MISMATCH' };
    return { ...log, staffId: staff.id, deviceId: device.id, processingState:'VALIDATED' };
  },

  async syncDevice(device){
    return deviceApi.syncAttendance(device);
  },
};
