/**
 * Biometric — Device Configuration
 * ------------------------------------------------------------------
 * LabourPro's frontend never talks to biometric hardware directly.
 * Browsers cannot universally speak proprietary terminal protocols
 * (TCP/4370 push protocols, vendor SDKs, ISAPI, WebSocket agents,
 * etc.), so all device I/O is delegated to a configurable backend
 * "device gateway" service. This file is the single place that
 * config lives, so pointing LabourPro at a real gateway is a one-line
 * change — nothing in the UI or biometric layer needs to change.
 *
 * When you connect your actual machine, implement the gateway's
 * REST/WebSocket surface to match device-api.js's expectations, using
 * whatever protocol/SDK your hardware vendor ships (e.g. ZKTeco
 * PUSH/SDK, Suprema BioStar API, ESSL, Hikvision ISAPI, etc.) — this
 * layer intentionally does not assume which one.
 * ------------------------------------------------------------------
 */
export const deviceConfig = {
  // Base URL of your device gateway. Not configured out of the box.
  gatewayBaseUrl: null, // e.g. 'https://gateway.internal.yourco.com/api'

  // Auth token/header for the gateway, injected by your deployment.
  gatewayAuthHeader: null,

  // Timeouts (ms)
  connectTimeoutMs: 8000,
  requestTimeoutMs: 12000,

  // Poll interval for health checks when no push/webhook channel exists.
  healthPollMs: 15000,

  // Live event channel. LIVE mode expects the gateway to push events
  // (WebSocket/SSE) to this path; DEVELOPMENT mode never touches it.
  liveEventSocketPath: '/attendance/stream',

  isGatewayConfigured(){
    return Boolean(this.gatewayBaseUrl);
  },
};
