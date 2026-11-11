import React from 'react';
import ReactTestRenderer, {
  ReactTestRenderer as Renderer,
} from 'react-test-renderer';

import { Button } from '../src/components/common/Button';
import { EmptyState } from '../src/components/common/EmptyState';
import { CenterCard } from '../src/components/centers/CenterCard';
import { TherapistCard } from '../src/components/therapists/TherapistCard';
import { I18nProvider } from '../src/i18n/I18nProvider';
import { setRequestLocale } from '../src/i18n/locale';

/**
 * Coverage of the UI primitives: they are the basis of the app accessibility, so
 * the tests check that they expose role, label and state to the screen reader.
 *
 * The cards read texts from the dictionary, so they are mounted inside
 * `I18nProvider`. The language is pinned to Spanish before each test: in Node the
 * detected language is the system one (`en-US`), and these assertions check the
 * original product texts, not the translation.
 */

beforeEach(() => {
  setRequestLocale('es');
});

async function render(element: React.ReactElement): Promise<Renderer> {
  let tree: Renderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<I18nProvider>{element}</I18nProvider>);
  });
  return tree!;
}

describe('Button', () => {
  it('se anuncia como botón con su título', async () => {
    const tree = await render(<Button title="Confirmar reserva" onPress={() => {}} />);
    const button = tree.root.findByProps({ accessibilityRole: 'button' });

    expect(button.props.accessibilityLabel).toBe('Confirmar reserva');
    expect(button.props.accessibilityState).toEqual({
      disabled: false,
      busy: false,
    });
  });

  it('anuncia el estado ocupado y bloqueado mientras carga', async () => {
    const tree = await render(
      <Button title="Confirmar reserva" onPress={() => {}} loading />,
    );
    const button = tree.root.findByProps({ accessibilityRole: 'button' });

    expect(button.props.accessibilityState).toEqual({
      disabled: true,
      busy: true,
    });
    // The title stays available even while the spinner is shown.
    expect(button.props.accessibilityLabel).toBe('Confirmar reserva');
  });

  it('marca el estado deshabilitado cuando se pasa `disabled`', async () => {
    const tree = await render(<Button title="Listo" onPress={() => {}} disabled />);
    const button = tree.root.findByProps({ accessibilityRole: 'button' });

    // The tap block is applied by `TouchableOpacity` from this
    // flag; here it is checked that it exposes the right state.
    expect(button.props.accessibilityState).toEqual({
      disabled: true,
      busy: false,
    });
    expect(button.props.disabled).toBe(true);
  });
});

describe('EmptyState', () => {
  it('expone la acción como botón y la ejecuta', async () => {
    const onAction = jest.fn();
    const tree = await render(
      <EmptyState
        title="No se pudieron cargar los centros"
        actionLabel="Reintentar"
        onAction={onAction}
      />,
    );
    const action = tree.root.findByProps({ accessibilityRole: 'button' });

    expect(action.props.accessibilityLabel).toBe('Reintentar');
    action.props.onPress();
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('anuncia el título como región viva', async () => {
    const tree = await render(<EmptyState title="Sin horarios" />);
    const title = tree.root.findByProps({ accessibilityRole: 'header' });

    expect(title.props.accessibilityLiveRegion).toBe('polite');
  });

  it('no renderiza acción si falta el label o el handler', async () => {
    const tree = await render(<EmptyState title="Sin horarios" />);

    expect(tree.root.findAllByProps({ accessibilityRole: 'button' })).toHaveLength(0);
  });
});

describe('CenterCard', () => {
  it('se anuncia como botón con el nombre del centro', async () => {
    const tree = await render(
      <CenterCard center={{ id: 'c1', name: 'Centro Demo Norte' }} onSelect={() => {}} />,
    );
    const card = tree.root.findByProps({ accessibilityRole: 'button' });

    expect(card.props.accessibilityLabel).toBe('Ver terapeutas de Centro Demo Norte');
  });
});

describe('TherapistCard', () => {
  it('incluye nombre y especialidad en la etiqueta', async () => {
    const tree = await render(
      <TherapistCard
        therapist={{
          id: 't1',
          userId: 'u1',
          centerId: 'c1',
          specialty: 'Terapia familiar',
          isActive: true,
          createdAt: '',
          updatedAt: '',
          user: { id: 'u1', firstName: 'Ana', lastName: 'Ruiz' },
        }}
        onSelect={() => {}}
      />,
    );
    const card = tree.root.findByProps({ accessibilityRole: 'button' });

    expect(card.props.accessibilityLabel).toBe('Ana Ruiz, Terapia familiar');
  });

  it('usa un nombre por defecto cuando el terapeuta no tiene datos', async () => {
    const tree = await render(
      <TherapistCard
        therapist={{
          id: 't2',
          userId: 'u2',
          centerId: 'c1',
          isActive: true,
          createdAt: '',
          updatedAt: '',
        }}
        onSelect={() => {}}
      />,
    );
    const card = tree.root.findByProps({ accessibilityRole: 'button' });

    expect(card.props.accessibilityLabel).toBe('Terapeuta');
  });
});
