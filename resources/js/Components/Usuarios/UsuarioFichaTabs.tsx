import { Nav, Tab } from 'react-bootstrap';
import { DireccionesTab } from '@Components/Usuarios/Tabs/DireccionesTab';
import { GeneralTab } from '@Components/Usuarios/Tabs/GeneralTab';
import { NotasTab } from '@Components/Usuarios/Tabs/NotasTab';
import type { UserTabStates } from '@Hooks/useLazyUserTabs';
import { USER_TABS, type UserTab } from '@Types/usuario';
import styles from './UsuarioFichaTabs.module.css';

const ETIQUETAS: Record<UserTab, string> = {
  general: 'Información general',
  direcciones: 'Direcciones',
  notas: 'Notas',
};

interface UsuarioFichaTabsProps {
  activeTab: UserTab;
  onRetry: (tab: UserTab) => void;
  onSelect: (key: string | null) => void;
  states: UserTabStates;
}

/**
 * Navegación de la ficha y su contenido. `Tab.Container` en vez de `Tabs` porque
 * separa la lista del panel: es lo que permite ponerlos en dos columnas a partir
 * de `lg` y apilarlos por debajo, sin duplicar marcado.
 */
export function UsuarioFichaTabs({ activeTab, onRetry, onSelect, states }: UsuarioFichaTabsProps) {
  return (
    <Tab.Container activeKey={activeTab} id="ficha-usuario-tabs" mountOnEnter onSelect={onSelect}>
      <div className={styles['ficha-tabs']}>
        <Nav className={styles['ficha-tabs__nav']}>
          {USER_TABS.map((tab) => (
            <Nav.Link eventKey={tab} key={tab}>
              {ETIQUETAS[tab]}
            </Nav.Link>
          ))}
        </Nav>
        <Tab.Content className={styles['ficha-tabs__content']}>
          <Tab.Pane eventKey="general">
            <GeneralTab onRetry={() => onRetry('general')} state={states.general} />
          </Tab.Pane>
          <Tab.Pane eventKey="direcciones">
            <DireccionesTab onRetry={() => onRetry('direcciones')} state={states.direcciones} />
          </Tab.Pane>
          <Tab.Pane eventKey="notas">
            <NotasTab onRetry={() => onRetry('notas')} state={states.notas} />
          </Tab.Pane>
        </Tab.Content>
      </div>
    </Tab.Container>
  );
}
