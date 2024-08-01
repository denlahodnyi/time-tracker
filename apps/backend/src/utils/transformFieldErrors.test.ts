import transformFieldErrors from './transformFieldErrors';

describe('transformFieldErrors()', () => {
  it('returns properly formatted object', () => {
    expect(
      transformFieldErrors({
        email: ['error1', 'error2'],
        password: ['error1'],
        address: {
          country: ['error1', 'error2'],
          street: {
            _errors: ['error1'], // object specific error
            apartment: ['error1'],
          },
        },
      }),
    ).toEqual({
      email: {
        _errors: ['error1', 'error2'],
      },
      password: {
        _errors: ['error1'],
      },
      address: {
        country: {
          _errors: ['error1', 'error2'],
        },
        street: {
          _errors: ['error1'],
          apartment: {
            _errors: ['error1'],
          },
        },
      },
    });
  });
});
