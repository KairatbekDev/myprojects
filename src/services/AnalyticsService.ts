/**
 * Advanced Analytics Engine v2.0
 * Модуль для сложной обработки потоковых данных
 */

export interface SystemSnapshot {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  activeThreads: number;
  networkLatency: string;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

class AnalyticsEngine {
  private history: SystemSnapshot[] = [];
  private maxHistoryLength = 100;

  // Генерация случайных, но реалистичных данных
  public generateSnapshot(): SystemSnapshot {
    const snapshot: SystemSnapshot = {
      timestamp: new Date().toLocaleTimeString(),
      cpuUsage: Math.floor(Math.random() * 100),
      memoryUsage: Math.floor(Math.random() * 64) + 16,
      activeThreads: Math.floor(Math.random() * 1000) + 200,
      networkLatency: `${Math.floor(Math.random() * 50) + 5}ms`,
      threatLevel: this.calculateThreatLevel(),
    };

    this.updateHistory(snapshot);
    return snapshot;
  }

  private calculateThreatLevel(): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const rand = Math.random();
    if (rand > 0.95) return 'CRITICAL';
    if (rand > 0.8) return 'HIGH';
    if (rand > 0.5) return 'MEDIUM';
    return 'LOW';
  }

  private updateHistory(snapshot: SystemSnapshot) {
    this.history.push(snapshot);
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }
  }

  public getAverages() {
    if (this.history.length === 0) return null;
    const sumCpu = this.history.reduce((acc, curr) => acc + curr.cpuUsage, 0);
    return {
      avgCpu: (sumCpu / this.history.length).toFixed(2),
      uptime: '99.99%',
      dataProcessed: `${(Math.random() * 500).toFixed(1)} GB`
    };
  }
}

export const analyticsEngine = new AnalyticsEngine();
