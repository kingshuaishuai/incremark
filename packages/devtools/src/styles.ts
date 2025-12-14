export const styles = `
.incremark-devtools {
  position: fixed;
  z-index: 99999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
  font-size: 13px;
  line-height: 1.5;
}

.incremark-devtools.bottom-right { bottom: 20px; right: 20px; }
.incremark-devtools.bottom-left { bottom: 20px; left: 20px; }
.incremark-devtools.top-right { top: 20px; right: 20px; }
.incremark-devtools.top-left { top: 20px; left: 20px; }

.incremark-devtools * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.devtools-trigger {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: #1e1e1e;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  position: relative;
  font-size: 20px;
}

.devtools-trigger:hover {
  background: #2d2d2d;
}

.loading-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.devtools-panel {
  position: absolute;
  width: 420px;
  max-height: 500px;
  background: #1e1e1e;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  display: none;
  flex-direction: column;
}

.devtools-panel.open {
  display: flex;
}

.bottom-right .devtools-panel,
.bottom-left .devtools-panel {
  bottom: 60px;
}

.top-right .devtools-panel,
.top-left .devtools-panel {
  top: 60px;
}

.bottom-right .devtools-panel,
.top-right .devtools-panel {
  right: 0;
}

.bottom-left .devtools-panel,
.top-left .devtools-panel {
  left: 0;
}

.devtools-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #252525;
  border-bottom: 1px solid #333;
}

.devtools-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.devtools-tabs {
  display: flex;
  gap: 4px;
  margin-left: auto;
  margin-right: 12px;
}

.devtools-tabs button {
  padding: 4px 10px;
  border: none;
  background: transparent;
  color: #888;
  cursor: pointer;
  border-radius: 4px;
  font-size: 12px;
  text-transform: capitalize;
}

.devtools-tabs button.active {
  background: #3b82f6;
  color: white;
}

.close-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #888;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}

.close-btn:hover {
  color: #fff;
}

.devtools-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  color: #e0e0e0;
  min-height: 200px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  background: #2a2a2a;
  padding: 12px;
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
}

.stat-label {
  font-size: 11px;
  color: #888;
  margin-top: 4px;
}

.stat-card.completed .stat-value { color: #22c55e; }
.stat-card.pending .stat-value { color: #a855f7; }

.section {
  margin-bottom: 20px;
}

.section h4 {
  margin: 0 0 12px;
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
}

.type-bars {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.type-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.type-name { flex: 1; }
.type-count { color: #888; }

.status-indicator {
  padding: 8px 12px;
  background: #2a2a2a;
  border-radius: 6px;
}

.status-indicator.loading {
  background: #22c55e20;
  color: #22c55e;
}

.blocks-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.block-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
}

.block-item:hover { background: #2a2a2a; }
.block-item.selected { background: #3b82f620; }

.block-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #888;
}

.block-status.completed { background: #22c55e; }
.block-status.pending { background: #a855f7; }

.block-type {
  font-weight: 600;
  min-width: 80px;
}

.block-preview {
  color: #888;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.block-detail {
  background: #2a2a2a;
  padding: 12px;
  border-radius: 8px;
}

.block-detail h4,
.block-detail h5 {
  margin: 0 0 8px;
  font-size: 12px;
  color: #888;
}

.block-detail h5 { margin-top: 12px; }

.detail-row {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.detail-row .label {
  color: #888;
  min-width: 50px;
}

.detail-row .value.completed { color: #22c55e; }
.detail-row .value.pending { color: #a855f7; }

.raw-text,
.ast-json,
.ast-tree {
  background: #1a1a1a;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  font-size: 11px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 150px;
  font-family: monospace;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.timeline-header button {
  padding: 4px 8px;
  border: none;
  background: #333;
  color: #888;
  border-radius: 4px;
  cursor: pointer;
}

.timeline-list {
  max-height: 300px;
  overflow-y: auto;
}

.timeline-item {
  display: flex;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #333;
  font-size: 12px;
}

.timeline-item .time {
  color: #888;
  min-width: 70px;
}

.timeline-item .chunk {
  flex: 1;
  color: #22c55e;
  font-family: monospace;
}

.timeline-item .stats { color: #888; }

/* Light theme */
.incremark-devtools.light .devtools-trigger {
  background: #fff;
  color: #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.incremark-devtools.light .devtools-panel {
  background: #fff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.incremark-devtools.light .devtools-header {
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.incremark-devtools.light .devtools-header h3 { color: #333; }
.incremark-devtools.light .devtools-content { color: #333; }
.incremark-devtools.light .stat-card { background: #f5f5f5; }
.incremark-devtools.light .stat-value { color: #333; }
`

