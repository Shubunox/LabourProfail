/**
 * LabourPro — Data Models
 * ------------------------------------------------------------------
 * These typedefs are the schema contract shared by the mock store
 * (js/data/mockStore.js) and the service layer (js/services/api.js).
 * A real backend/database should implement these exact shapes so the
 * frontend requires no changes when the mock layer is swapped for
 * live API calls. Field names map 1:1 to likely relational columns.
 * ------------------------------------------------------------------
 *
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {'3PL_CEO'|'OPS_HEAD'|'CLUSTER_MANAGER'|'FACILITY_MANAGER'|'VENDOR'|'COMPLIANCE'|'LEGAL'|'FINANCE'|'DNA'|'ADMIN'} role
 * @property {string[]} warehouseIds
 * @property {'ACTIVE'|'DISABLED'} status
 *
 * @typedef {Object} Warehouse
 * @property {string} id
 * @property {string} code
 * @property {string} name
 * @property {string} city
 * @property {string} state
 * @property {'OPERATIONAL'|'PAUSED'|'SETUP'} status
 * @property {number} approvedStrength
 * @property {number} actualStrength
 * @property {{start:string,end:string,shifts:number}} workingHours
 * @property {number} otThresholdHrs
 *
 * @typedef {Object} LabourVendor
 * @property {string} id
 * @property {string} name
 * @property {string} code
 * @property {string[]} warehouseIds
 * @property {'ACTIVE'|'ONBOARDING'|'SUSPENDED'|'BLACKLISTED'} status
 * @property {'COMPLIANT'|'PENDING'|'EXPIRED'} complianceStatus
 * @property {'ACTIVE'|'EXPIRING'|'EXPIRED'|'NONE'} contractStatus
 * @property {number} workforceCount
 * @property {number} monthlyCost
 * @property {string} gstin
 *
 * @typedef {Object} LabourStaff
 * @property {string} id
 * @property {string} biometricId
 * @property {string} name
 * @property {'SKILLED'|'SEMI_SKILLED'|'UNSKILLED'} category
 * @property {string} vendorId
 * @property {string} warehouseId
 * @property {'IN_PLANT'|'AD_HOC'} deployment
 * @property {number} dailyWage
 * @property {'PENDING_APPROVAL'|'ACTIVE'|'INACTIVE'|'BLACKLISTED'} status
 * @property {boolean} biometricEnrolled
 * @property {boolean} verified
 *
 * @typedef {Object} LabourStructure
 * @property {string} warehouseId
 * @property {'SKILLED'|'SEMI_SKILLED'|'UNSKILLED'} category
 * @property {number} approved
 * @property {number} allocated
 * @property {number} actual
 *
 * @typedef {Object} AttendanceEvent
 * @property {string} id
 * @property {string} staffId
 * @property {string} deviceId
 * @property {string} warehouseId
 * @property {'IN'|'OUT'} eventType
 * @property {string} timestamp ISO-8601
 * @property {'BIOMETRIC'|'MANUAL_AUTHORIZED'} method
 * @property {'RECEIVED'|'VALIDATED'|'PROCESSED'|'EXCEPTION'|'REJECTED'} processingState
 *
 * @typedef {Object} AttendanceException
 * @property {string} id
 * @property {string} staffId
 * @property {string} warehouseId
 * @property {'MISSING_IN'|'MISSING_OUT'|'INSUFFICIENT_HOURS'|'INVALID_ATTENDANCE'|'DEVICE_MISMATCH'|'WAREHOUSE_MISMATCH'|'WORKFORCE_LIMIT_EXCEEDED'} type
 * @property {'OPEN'|'RESOLVED'} status
 * @property {string} date
 * @property {{action:string,reason:string,user:string,timestamp:string}|null} resolution
 *
 * @typedef {Object} BiometricDevice
 * @property {string} id
 * @property {string} name
 * @property {'FINGERPRINT'|'FACE'|'HYBRID'} type
 * @property {string} model
 * @property {string} serial
 * @property {string} ip
 * @property {number} port
 * @property {string} warehouseId
 * @property {'CONNECTED'|'DISCONNECTED'|'SYNCING'|'ERROR'|'AUTHENTICATING'} connectionStatus
 * @property {string} lastSync
 * @property {string} firmware
 * @property {number} registeredUsers
 * @property {'LIVE'|'DEVELOPMENT'} mode
 *
 * @typedef {Object} AdHocRequest
 * @property {string} id
 * @property {string} warehouseId
 * @property {string} vendorId
 * @property {'SKILLED'|'SEMI_SKILLED'|'UNSKILLED'} category
 * @property {number} quantity
 * @property {string} startDate
 * @property {string} endDate
 * @property {string} reason
 * @property {string} requester
 * @property {'PENDING'|'APPROVED'|'REJECTED'} status
 *
 * @typedef {Object} OvertimeRecord
 * @property {string} id
 * @property {string} staffId
 * @property {string} date
 * @property {number} regularHrs
 * @property {number} actualHrs
 * @property {number} extraHrs
 * @property {'PAYMENT'|'COMP_OFF'} compensationType
 * @property {'PENDING'|'APPROVED'|'PAID'} status
 *
 * @typedef {Object} CostAccrual
 * @property {string} id
 * @property {string} staffId
 * @property {string} warehouseId
 * @property {string} date
 * @property {number} baseWage
 * @property {number} holidayWage
 * @property {number} overtimeComp
 * @property {number} serviceCharge
 * @property {number} total
 *
 * @typedef {Object} PurchaseOrder
 * @property {string} id
 * @property {string} vendorId
 * @property {string} warehouseId
 * @property {string} period
 * @property {string} contractId
 * @property {number} total
 * @property {'DRAFT'|'ISSUED'|'ACKNOWLEDGED'|'CLOSED'} status
 *
 * @typedef {Object} BillableSchedule
 * @property {string} id
 * @property {string} vendorId
 * @property {string} warehouseId
 * @property {string} month
 * @property {number} labourQty
 * @property {number} monthlyTotal
 * @property {'GENERATED'|'VENDOR_REVIEW'|'INVOICE_UPLOADED'|'MATCHED'|'TOLERANCE'|'CLARIFICATION'|'APPROVED'|'POSTED'} status
 *
 * @typedef {Object} Invoice
 * @property {string} id
 * @property {string} vendorId
 * @property {string} scheduleId
 * @property {number} calculatedAmount
 * @property {number} invoicedAmount
 * @property {'MATCHED'|'MATCHED_TOLERANCE'|'CLARIFICATION_REQUIRED'} matchStatus
 *
 * @typedef {Object} Approval
 * @property {string} id
 * @property {'LABOUR_STRUCTURE'|'VENDOR'|'STAFF'|'AD_HOC'|'OVERTIME'|'INVOICE'|'CONTRACT'} type
 * @property {string} title
 * @property {string} requester
 * @property {'LOW'|'MEDIUM'|'HIGH'|'CRITICAL'} priority
 * @property {'PENDING'|'APPROVED'|'REJECTED'} status
 * @property {string} createdAt
 *
 * @typedef {Object} ComplianceDocument
 * @property {string} id
 * @property {string} vendorId
 * @property {'GST'|'GST_FILING'|'PF'|'ESIC'|'ITR'|'BALANCE_SHEET'|'PL'} type
 * @property {'VERIFIED'|'PENDING'|'EXPIRED'|'REJECTED'|'REVIEW_REQUIRED'} status
 * @property {string} expiryDate
 *
 * @typedef {Object} AuditLog
 * @property {string} id
 * @property {string} user
 * @property {string} role
 * @property {string} action
 * @property {string} entity
 * @property {string} entityId
 * @property {string} timestamp
 * @property {string} ip
 */
export const MODELS_VERSION = '1.0.0';
