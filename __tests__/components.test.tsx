import React from 'react';
import ReactTestRenderer, {
  ReactTestRenderer as Renderer,
} from 'react-test-renderer';

import { Button } from '../src/components/common/Button';
import { EmptyState } from '../src/components/common/EmptyState';
import { CenterCard } from '../src/components/centers/CenterCard';
import { TherapistCard } from '../src/components/therapists/TherapistCard';

/**
 * Cobertura de los primitivos de UI: son la base de la accesibilidad de la app,
 * así que se verifica que expongan rol, etiqueta y estado al lector de pantalla.
 */

async function render(element: React.ReactElement): Promise<Renderer> {
  let tree: Renderer | undefined;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(element);
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
    // El título sigue disponible aunque se muestre el spinner.
    expect(button.props.accessibilityLabel).toBe('Confirmar reserva');
  });

  it('marca el estado deshabilitado cuando se pasa `disabled`', async () => {
    const tree = await render(<Button title="Listo" onPress={() => {}} disabled />);
    const button = tree.root.findByProps({ accessibilityRole: 'button' });

    // El bloqueo del toque lo aplica `TouchableOpacity` a partir de esta
    // bandera; aquí se verifica que exponga el estado correcto.
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
