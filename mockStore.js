/**
 * LabourPro — Mock Data Store
 * ------------------------------------------------------------------
 * This is a technical placeholder standing in for a real database.
 * It follows the model shapes in models.js exactly, so the service
 * layer (js/services/api.js) can be pointed at a real backend later
 * without any change to page code.
 *
 * IMPORTANT: the store boots EMPTY. Nothing here is presented to the
 * user as real operational data. A single, clearly-labeled
 * `seedDevData()` function exists purely so this technical demo has
 * something to render — every record it creates is tagged
 * `_devMode:true` and the UI must visibly mark such records as
 * DEVELOPMENT DATA, never as live records.
 * ------------------------------------------------------------------
 */
const LS_KEY = 'labourpro_store_v1';

function uid(prefix){ return `${prefix}-${Math.random().toString(36).slice(2,8).toUpperCase()}`; }

function emptyState(){
  return {
    devMode: false,
    warehouses: [], vendors: [], staff: [], structure: [],
    attendanceEvents: [], exceptions: [], devices: [],
    adHocRequests: [], transfers: [], overtime: [], accruals: [],
    purchaseOrders: [], billableSchedules: [], invoices: [],
    approvals: [], compliance: [], auditLogs: [], notifications: [],
  };
}

let state = load();

function load(){
  try{
    const raw = sessionStorage.getItem(LS_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){ /* fall through */ }
  return emptyState();
}
function persist(){
  try{ sessionStorage.setItem(LS_KEY, JSON.stringify(state)); }catch(e){}
}

export const store = {
  get(){ return state; },
  reset(){ state = emptyState(); persist(); },
  isDevMode(){ return state.devMode; },

  seedDevData(){
    const s = emptyState();
    s.devMode = true;

    const whNames = [
      ['BLR-1','Bengaluru North FC','Bengaluru','Karnataka'],
      ['BOM-2','Bhiwandi Regional Hub','Bhiwandi','Maharashtra'],
      ['DEL-3','Gurugram Cross-Dock','Gurugram','Haryana'],
      ['HYD-1','Hyderabad Fulfilment','Hyderabad','Telangana'],
      ['PNQ-2','Chakan Distribution Ctr','Pune','Maharashtra'],
    ];
    s.warehouses = whNames.map(([code,name,city,state_])=>({
      id: uid('WH'), code, name, city, state: state_,
      status: ['OPERATIONAL','OPERATIONAL','OPERATIONAL','SETUP','OPERATIONAL'][Math.floor(Math.random()*5)],
      approvedStrength: 180 + Math.floor(Math.random()*220),
      actualStrength: 0,
      workingHours: { start:'08:00', end:'20:00', shifts:2 },
      otThresholdHrs: 9,
      _devMode:true,
    }));

    const vendorNames = ['Suvidha Manpower Services','Pragati Workforce Solutions','Nexus Labour Contractors','Vishwas Staffing Pvt Ltd','Anand Industrial Manpower','Kirti Logistics Workforce'];
    s.vendors = vendorNames.map(name=>{
      const wh = pick(s.warehouses, 1+Math.floor(Math.random()*2));
      return {
        id: uid('VEN'), name, code: name.split(' ').map(w=>w[0]).join('').slice(0,4).toUpperCase(),
        warehouseIds: wh.map(w=>w.id),
        status: weighted(['ACTIVE','ACTIVE','ACTIVE','ONBOARDING','SUSPENDED']),
        complianceStatus: weighted(['COMPLIANT','COMPLIANT','PENDING','EXPIRED']),
        contractStatus: weighted(['ACTIVE','ACTIVE','EXPIRING','EXPIRED']),
        workforceCount: 20+Math.floor(Math.random()*140),
        monthlyCost: 900000+Math.floor(Math.random()*3200000),
        gstin: `27${Math.random().toString(36).slice(2,11).toUpperCase()}1Z${Math.floor(Math.random()*9)}`,
        _devMode:true,
      };
    });

    const catW = ['SKILLED','SEMI_SKILLED','UNSKILLED'];
    const firstNames = ['Ravi','Suresh','Anil','Mahesh','Vijay','Ramesh','Sunil','Ajay','Deepak','Manoj','Prakash','Santosh','Arun','Naveen','Rajesh','Kiran','Ganesh','Vinod','Ashok','Yogesh'];
    const lastNames = ['Kumar','Sharma','Patil','Reddy','Singh','Yadav','Gupta','Verma','Nair','Iyer','Shah','Rao','Chauhan','Mishra','Pawar'];
    s.staff = Array.from({length:260}).map(()=>{
      const wh = s.warehouses[Math.floor(Math.random()*s.warehouses.length)];
      const ven = s.vendors.filter(v=>v.warehouseIds.includes(wh.id))[0] || s.vendors[Math.floor(Math.random()*s.vendors.length)];
      const name = `${pickOne(firstNames)} ${pickOne(lastNames)}`;
      return {
        id: uid('EMP'), biometricId: uid('BIO'), name,
        category: weighted(catW.concat(catW).concat('UNSKILLED')),
        vendorId: ven.id, warehouseId: wh.id,
        deployment: Math.random()>0.82 ? 'AD_HOC':'IN_PLANT',
        dailyWage: 520 + Math.floor(Math.random()*480),
        status: weighted(['ACTIVE','ACTIVE','ACTIVE','ACTIVE','PENDING_APPROVAL','INACTIVE']),
        biometricEnrolled: Math.random()>0.18,
        verified: Math.random()>0.1,
        _devMode:true,
      };
    });
    s.warehouses.forEach(w=>{ w.actualStrength = s.staff.filter(e=>e.warehouseId===w.id && e.status==='ACTIVE').length; });

    catW.forEach(cat=>{
      s.warehouses.forEach(w=>{
        const approved = 40+Math.floor(Math.random()*70);
        const allocated = approved - Math.floor(Math.random()*10);
        const actual = s.staff.filter(e=>e.warehouseId===w.id && e.category===cat && e.status==='ACTIVE').length;
        s.structure.push({ warehouseId:w.id, category:cat, approved, allocated, actual, _devMode:true });
      });
    });

    s.devices = s.warehouses.flatMap(w=>[0,1].map(i=>({
      id: uid('DEV'), name:`${w.code} Gate ${i===0?'Entry':'Exit'} Terminal`,
      type: weighted(['FINGERPRINT','FACE','HYBRID']),
      model:'EssL X990-Bio', serial: uid('SN'),
      ip:`10.${Math.floor(Math.random()*40+10)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`,
      port:4370, warehouseId:w.id,
      connectionStatus: weighted(['CONNECTED','CONNECTED','CONNECTED','DISCONNECTED','ERROR']),
      lastSync: minutesAgo(Math.floor(Math.random()*180)),
      firmware:'v6.60.1', registeredUsers: 30+Math.floor(Math.random()*180),
      mode:'DEVELOPMENT', _devMode:true,
    })));

    const excTypes = ['MISSING_IN','MISSING_OUT','INSUFFICIENT_HOURS','INVALID_ATTENDANCE','DEVICE_MISMATCH','WAREHOUSE_MISMATCH','WORKFORCE_LIMIT_EXCEEDED'];
    s.exceptions = Array.from({length:34}).map(()=>{
      const staff = pickOne(s.staff);
      const open = Math.random()>0.4;
      return {
        id: uid('EXC'), staffId: staff.id, warehouseId: staff.warehouseId,
        type: pickOne(excTypes), status: open?'OPEN':'RESOLVED',
        date: daysAgo(Math.floor(Math.random()*6)),
        resolution: open?null:{ action:'Marked as authorized manual entry', reason:'Device offline during shift start', user:'facility.manager@labourpro', timestamp:minutesAgo(Math.floor(Math.random()*600)) },
        _devMode:true,
      };
    });

    s.adHocRequests = Array.from({length:14}).map(()=>{
      const wh = pickOne(s.warehouses); const ven = pickOne(s.vendors);
      return { id: uid('ADH'), warehouseId:wh.id, vendorId:ven.id, category:pickOne(catW),
        quantity: 5+Math.floor(Math.random()*40), startDate: daysAgo(-Math.floor(Math.random()*10)),
        endDate: daysAgo(-Math.floor(Math.random()*10)-14), reason:'Seasonal peak volume surge',
        requester:'facility.manager@labourpro', status: weighted(['PENDING','APPROVED','APPROVED','REJECTED']), _devMode:true };
    });

    s.overtime = Array.from({length:40}).map(()=>{
      const staff = pickOne(s.staff); const reg=9, act= reg+1+Math.random()*3;
      return { id: uid('OT'), staffId:staff.id, date: daysAgo(Math.floor(Math.random()*10)),
        regularHrs:reg, actualHrs:+act.toFixed(1), extraHrs:+(act-reg).toFixed(1),
        compensationType: weighted(['PAYMENT','COMP_OFF']), status: weighted(['PENDING','APPROVED','PAID']), _devMode:true };
    });

    s.accruals = Array.from({length:120}).map(()=>{
      const staff = pickOne(s.staff); const base = staff.dailyWage;
      const holiday = Math.random()>0.9 ? base : 0;
      const ot = Math.random()>0.75 ? Math.round(base*0.3) : 0;
      const svc = Math.round(base*0.18);
      return { id: uid('ACR'), staffId:staff.id, warehouseId:staff.warehouseId, date: daysAgo(Math.floor(Math.random()*7)),
        baseWage:base, holidayWage:holiday, overtimeComp:ot, serviceCharge:svc, total: base+holiday+ot+svc, _devMode:true };
    });

    s.purchaseOrders = Array.from({length:16}).map(()=>{
      const ven = pickOne(s.vendors); const wh = pickOne(s.warehouses);
      return { id: uid('PO'), vendorId:ven.id, warehouseId:wh.id, period:'Aug 2026', contractId: uid('CTR'),
        total: 800000+Math.floor(Math.random()*2200000), status: weighted(['DRAFT','ISSUED','ACKNOWLEDGED','CLOSED']), _devMode:true };
    });

    s.billableSchedules = Array.from({length:16}).map(()=>{
      const ven = pickOne(s.vendors); const wh = pickOne(s.warehouses);
      const qty = 40+Math.floor(Math.random()*120);
      return { id: uid('BS'), vendorId:ven.id, warehouseId:wh.id, month:'Aug 2026', labourQty:qty,
        monthlyTotal: qty*950*26, status: weighted(['GENERATED','VENDOR_REVIEW','INVOICE_UPLOADED','MATCHED','TOLERANCE','CLARIFICATION','APPROVED','POSTED']), _devMode:true };
    });

    s.invoices = s.billableSchedules.slice(0,10).map(bs=>{
      const calc = bs.monthlyTotal;
      const drift = (Math.random()-0.4)*0.06;
      const invoiced = Math.round(calc*(1+drift));
      const diffPct = Math.abs(invoiced-calc)/calc;
      return { id: uid('INV'), vendorId:bs.vendorId, scheduleId:bs.id, calculatedAmount:calc, invoicedAmount:invoiced,
        matchStatus: diffPct<0.005?'MATCHED': diffPct<0.02?'MATCHED_TOLERANCE':'CLARIFICATION_REQUIRED', _devMode:true };
    });

    const apprTypes = ['LABOUR_STRUCTURE','VENDOR','STAFF','AD_HOC','OVERTIME','INVOICE','CONTRACT'];
    s.approvals = Array.from({length:22}).map(()=>({
      id: uid('APR'), type: pickOne(apprTypes),
      title: pickOne(['Workforce increase — BLR-1 Unskilled','New vendor onboarding — Kirti Logistics','Ad-hoc labour request — peak surge','Overtime approval batch — Aug W2','Invoice clarification — Nexus Labour','Contract renewal — Vishwas Staffing']),
      requester: pickOne(['facility.manager@labourpro','cluster.manager@labourpro','vendor.suvidha@labourpro']),
      priority: weighted(['LOW','MEDIUM','MEDIUM','HIGH','CRITICAL']),
      status: weighted(['PENDING','PENDING','APPROVED','REJECTED']),
      createdAt: minutesAgo(Math.floor(Math.random()*4000)), _devMode:true,
    }));

    const compTypes = ['GST','GST_FILING','PF','ESIC','ITR','BALANCE_SHEET','PL'];
    s.compliance = s.vendors.flatMap(v=>compTypes.map(t=>({
      id: uid('CMP'), vendorId:v.id, type:t,
      status: weighted(['VERIFIED','VERIFIED','PENDING','EXPIRED','REVIEW_REQUIRED']),
      expiryDate: daysAgo(-Math.floor(Math.random()*200)), _devMode:true,
    })));

    s.auditLogs = Array.from({length:60}).map(()=>({
      id: uid('AUD'), user: pickOne(['facility.manager@labourpro','ops.head@labourpro','admin@labourpro','vendor.suvidha@labourpro']),
      role: pickOne(['FACILITY_MANAGER','OPS_HEAD','ADMIN','VENDOR']),
      action: pickOne(['APPROVE','REJECT','UPDATE','CREATE','DEACTIVATE']),
      entity: pickOne(['LabourStructure','Vendor','Staff','Invoice','AdHocRequest']),
      entityId: uid('REF'), timestamp: minutesAgo(Math.floor(Math.random()*10000)),
      ip:`10.4.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`, _devMode:true,
    })).sort((a,b)=> new Date(b.timestamp)-new Date(a.timestamp));

    state = s; persist();
    return state;
  },

  clearDevData(){ state = emptyState(); persist(); },
};

function pick(arr,n){ const c=[...arr]; const out=[]; for(let i=0;i<n && c.length;i++){ out.push(c.splice(Math.floor(Math.random()*c.length),1)[0]); } return out; }
function pickOne(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function weighted(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function daysAgo(n){ const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString(); }
function minutesAgo(n){ const d=new Date(); d.setMinutes(d.getMinutes()-n); return d.toISOString(); }
