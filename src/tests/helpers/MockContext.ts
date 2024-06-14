import { mockDeep, type DeepMockProxy } from 'jest-mock-extended';

import type { Client } from '../../../db';

interface Context {
  client: Client;
}

interface MockedContext {
  client: DeepMockProxy<Client>;
}

const createMockContext = (): MockedContext => {
  return {
    client: mockDeep<Client>(),
  };
};

export default class MockContext {
  context!: Context;
  mockContext!: MockedContext;

  prepareEach() {
    this.mockContext = createMockContext();
    this.context = this.mockContext as unknown as Context;
  }
}
