export interface SystemEvent {
  id: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  message: string;
  time: string;
}

type EventMessage = {
  text: string;
  type: SystemEvent['type'];
};

class EventService {
  private messages: EventMessage[] = [
    { text: 'New crypto whale transaction detected', type: 'SUCCESS' },
    { text: 'Unauthorized node access attempt', type: 'WARNING' },
    { text: 'Neural network synchronization complete', type: 'INFO' },
    { text: 'Database latency exceeded 200ms', type: 'ERROR' },
    { text: 'Global traffic routing optimized', type: 'SUCCESS' },
  ];

  public generateEvent(): SystemEvent {
    const random = this.messages[Math.floor(Math.random() * this.messages.length)];
    return {
      id: Math.random().toString(36).substring(2, 11),
      type: random.type,
      message: random.text,
      time: new Date().toLocaleTimeString(),
    };
  }
}

export const eventService = new EventService();
