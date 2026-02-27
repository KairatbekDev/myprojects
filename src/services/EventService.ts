export interface SystemEvent {
  id: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  message: string;
  time: string;
}

class EventService {
  private messages = [
    { text: 'New crypto whale transaction detected', type: 'SUCCESS' },
    { text: 'Unauthorized node access attempt', type: 'WARNING' },
    { text: 'Neural network synchronization complete', type: 'INFO' },
    { text: 'Database latency exceeded 200ms', type: 'ERROR' },
    { text: 'Global traffic routing optimized', type: 'SUCCESS' }
  ];

  public generateEvent(): SystemEvent {
    const random = this.messages[Math.floor(Math.random() * this.messages.length)];
    return {
      id: Math.random().toString(36).substr(2, 9),
      type: random.type as any,
      message: random.text,
      time: new Date().toLocaleTimeString()
    };
  }
}

export const eventService = new EventService();