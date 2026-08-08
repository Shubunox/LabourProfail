/**
 * LabourPro — Service Layer
 * ------------------------------------------------------------------
 * Pages never touch mockStore directly. They call these async
 * functions. When a real backend exists, only this file changes —
 * swap the body of each function for a fetch() to the real endpoint
 * (e.g. GET /api/warehouses) and every page keeps working unmodified.
 * A small artificial latency is added so loading states are exercised
 * honestly during development.
 * ------------------------------------------------------------------
 */
import { store } from '../data/mockStore.js';

const LATENCY = 220;
function ok(data){ return new Promise(res=> setTimeout(()=>res(structuredClone(data)), LATENCY)); }

export const api = {
  // ---- system ----
  async getSystemStatus(){
    return ok({
      backend:'HEALTHY', database:'HEALTHY',
      biometricGateway: store.get().devices.length ? 'HEALTHY':'NOT_CONFIGURED',
      devices: store.get().devices.some(d=>d.connectionStatus==='ERROR') ? 'DEGRADED':'HEALTHY',
      attendanceSync:'HEALTHY', notificationService:'HEALTHY',
    });
  },
  isDevMode(){ return store.isDevMode(); },
  seedDevData(){ return store.seedDevData(); },
  clearDevData(){ return store.clearDevData(); },

  // ---- warehouses ----
  async listWarehouses(){ return ok(store.get().warehouses); },
  async getWarehouse(id){ return ok(store.get().warehouses.find(w=>w.id===id) || null); },

  // ---- vendors ----
  async listVendors(){ return ok(store.get().vendors); },
  async getVendor(id){ return ok(store.get().vendors.find(v=>v.id===id) || null); },

  // ---- staff ----
  async listStaff(){ return ok(store.get().staff); },
  async getStaff(id){ return ok(store.get().staff.find(s=>s.id===id) || null); },

  // ---- labour structure ----
  async listStructure(){ return ok(store.get().structure); },

  // ---- attendance ----
  async listAttendanceEvents(){ return ok(store.get().attendanceEvents); },
  async listExceptions(){ return ok(store.get().exceptions); },
  async resolveException(id, resolution){
    const s = store.get();
    const ex = s.exceptions.find(e=>e.id===id);
    if(ex){ ex.status='RESOLVED'; ex.resolution=resolution; }
    return ok(ex);
  },

  // ---- biometric devices ----
  async listDevices(){ return ok(store.get().devices); },
  async getDevice(id){ return ok(store.get().devices.find(d=>d.id===id) || null); },

  // ---- ad-hoc / transfers / overtime ----
  async listAdHocRequests(){ return ok(store.get().adHocRequests); },
  async listOvertime(){ return ok(store.get().overtime); },

  // ---- cost ----
  async listAccruals(){ return ok(store.get().accruals); },

  // ---- procurement ----
  async listPurchaseOrders(){ return ok(store.get().purchaseOrders); },
  async listBillableSchedules(){ return ok(store.get().billableSchedules); },
  async listInvoices(){ return ok(store.get().invoices); },

  // ---- governance ----
  async listApprovals(){ return ok(store.get().approvals); },
  async decideApproval(id, decision){
    const a = store.get().approvals.find(x=>x.id===id);
    if(a) a.status = decision;
    return ok(a);
  },
  async listCompliance(){ return ok(store.get().compliance); },
  async listAuditLogs(){ return ok(store.get().auditLogs); },
};
