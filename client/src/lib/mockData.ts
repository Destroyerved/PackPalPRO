// Mock data store
let mockEvents: any[] = [
  {
    id: 1,
    name: 'Demo Event',
    description: 'A demo event for testing',
    createdAt: new Date(),
    startDate: new Date(),
    endDate: new Date(),
    location: 'Demo Location',
    createdBy: 1,
    userRoles: {}
  }
];

export const mockApi = {
  createEvent: (eventData: any) => {
    const newEvent = {
      id: mockEvents.length + 1,
      ...eventData,
      createdBy: 1,
      createdAt: new Date(),
      userRoles: {}
    };
    mockEvents.push(newEvent);
    return newEvent;
  },
  getEvents: () => mockEvents,
  getEvent: (id: number) => mockEvents.find(e => e.id === id),
  updateEvent: (id: number, data: any) => {
    const index = mockEvents.findIndex(e => e.id === id);
    if (index !== -1) {
      mockEvents[index] = { ...mockEvents[index], ...data };
      return mockEvents[index];
    }
    return null;
  }
};
