import { ApiError, getErrorMessage } from '../src/api/errors';

describe('getErrorMessage', () => {
  it('usa el mensaje del backend cuando es un ApiError', () => {
    const error = new ApiError(
      'No hay terapeutas con disponibilidad presencial libre en el horario seleccionado',
      409,
    );

    expect(getErrorMessage(error)).toBe(
      'No hay terapeutas con disponibilidad presencial libre en el horario seleccionado',
    );
  });

  it('traduce el timeout del AbortController', () => {
    const abort = new Error('Aborted');
    abort.name = 'AbortError';

    expect(getErrorMessage(abort)).toBe(
      'La solicitud tardó demasiado. Revisa tu conexión e inténtalo de nuevo.',
    );
  });

  it('traduce los fallos de red de React Native y del navegador', () => {
    const expected =
      'No pudimos conectar con el servidor. Revisa tu conexión a internet.';

    expect(getErrorMessage(new Error('Network request failed'))).toBe(expected);
    expect(getErrorMessage(new Error('Failed to fetch'))).toBe(expected);
  });

  it('conserva los mensajes de otros errores', () => {
    expect(getErrorMessage(new Error('Algo raro'))).toBe('Algo raro');
  });

  it('no muestra "undefined" cuando el valor lanzado no es un Error', () => {
    expect(getErrorMessage('boom')).toBe(
      'Ocurrió un error inesperado. Inténtalo de nuevo.',
    );
    expect(getErrorMessage(undefined)).toBe(
      'Ocurrió un error inesperado. Inténtalo de nuevo.',
    );
  });
});
