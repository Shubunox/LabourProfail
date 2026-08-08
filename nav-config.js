export const NAV = [
  { group:null, items:[
    { key:'overview', label:'Overview', href:'index.html', icon:'grid' },
  ]},
  { group:'Workforce', items:[
    { key:'wf-structure', label:'Labour Structure', href:'workforce-structure.html', icon:'layers' },
    { key:'wf-staff', label:'Labour Staff', href:'workforce-staff.html', icon:'users' },
    { key:'wf-vendors', label:'Labour Vendors', href:'workforce-vendors.html', icon:'truck' },
    { key:'wf-transfers', label:'Labour Transfers', href:'workforce-transfers.html', icon:'arrows' },
    { key:'wf-adhoc', label:'Ad-Hoc Labour', href:'workforce-adhoc.html', icon:'userPlus' },
  ]},
  { group:'Attendance', items:[
    { key:'att-live', label:'Live Attendance', href:'attendance-live.html', icon:'activity' },
    { key:'att-records', label:'Attendance Records', href:'attendance-records.html', icon:'clock' },
    { key:'att-exceptions', label:'Exceptions', href:'attendance-exceptions.html', icon:'alertCircle' },
    { key:'att-devices', label:'Biometric Devices', href:'biometric-devices.html', icon:'fingerprint' },
  ]},
  { group:'Workforce Cost', items:[
    { key:'cost-accrual', label:'Daily Accrual', href:'cost-accrual.html', icon:'wallet' },
    { key:'cost-ot', label:'Overtime', href:'cost-overtime.html', icon:'clock' },
    { key:'cost-compoff', label:'Compensatory Off', href:'cost-compoff.html', icon:'refresh' },
    { key:'cost-analytics', label:'Cost Analytics', href:'cost-analytics.html', icon:'trending' },
  ]},
  { group:'Procurement', items:[
    { key:'proc-po', label:'Service POs', href:'procurement-pos.html', icon:'fileText' },
    { key:'proc-billable', label:'Monthly Billable Schedule', href:'procurement-billable.html', icon:'scroll' },
    { key:'proc-invoices', label:'Vendor Invoices', href:'procurement-invoices.html', icon:'receipt' },
  ]},
  { group:'Governance', items:[
    { key:'gov-approvals', label:'Approvals', href:'governance-approvals.html', icon:'checkCircle' },
    { key:'gov-compliance', label:'Compliance', href:'governance-compliance.html', icon:'shield' },
    { key:'gov-contracts', label:'Contracts', href:'governance-contracts.html', icon:'scroll' },
    { key:'gov-audit', label:'Audit Trail', href:'governance-audit.html', icon:'history' },
  ]},
  { group:'Analytics', items:[
    { key:'an-operational', label:'Operational Reports', href:'analytics-operational.html', icon:'barChart' },
    { key:'an-labour', label:'Labour Analytics', href:'analytics-labour.html', icon:'users' },
    { key:'an-cost', label:'Cost Analytics', href:'analytics-cost.html', icon:'pieChart' },
    { key:'an-vendor', label:'Vendor Analytics', href:'analytics-vendor.html', icon:'truck' },
  ]},
  { group:'Administration', items:[
    { key:'admin-warehouses', label:'Warehouses', href:'admin-warehouses.html', icon:'building' },
    { key:'admin-config', label:'Configuration', href:'admin-configuration.html', icon:'slidersH' },
    { key:'admin-users', label:'Users & Roles', href:'admin-users.html', icon:'briefcase' },
    { key:'admin-devices', label:'Device Management', href:'biometric-devices.html', icon:'server' },
    { key:'admin-settings', label:'System Settings', href:'admin-settings.html', icon:'settings' },
  ]},
];

export const PAGE_META = {}; // filled at runtime by shell.js using href lookups
NAV.forEach(g=> g.items.forEach(i=> PAGE_META[i.href] = { ...i, group:g.group }));
