import {
    IconAlertCircle,
    IconAlertTriangle,
    IconArrowLeft,
    IconDownload,
    IconEye,
    IconFilter,
    IconIdBadge2,
    IconInbox,
    IconMapPin,
    IconMoon,
    IconSearch,
    IconSun,
    IconTrash,
    IconUserPlus,
    IconX,
    type IconProps,
    type TablerIcon,
} from '@tabler/icons-react';

/**
 * Punto único de acceso a los iconos de la interfaz (Tabler Icons).
 *
 * Tabler dimensiona en píxeles (24 por defecto), pero `app.css` calcula el
 * tamaño de los iconos por `font-size` (`.brand__mark`, `.empty-state__icon`,
 * `.row-action > svg`) y el resto acompaña a texto. Por eso se re-exportan
 * fijando `size="1em"`, para que hereden el tamaño de su contenedor.
 */
function withInheritedSize(Icon: TablerIcon, displayName: string) {
    const Wrapped = (props: IconProps) => <Icon size="1em" stroke={1.75} {...props} />;

    Wrapped.displayName = displayName;

    return Wrapped;
}

export const AlertCircleIcon = withInheritedSize(IconAlertCircle, 'AlertCircleIcon');
export const AlertTriangleIcon = withInheritedSize(IconAlertTriangle, 'AlertTriangleIcon');
export const ArrowLeftIcon = withInheritedSize(IconArrowLeft, 'ArrowLeftIcon');
export const DownloadIcon = withInheritedSize(IconDownload, 'DownloadIcon');
export const EyeIcon = withInheritedSize(IconEye, 'EyeIcon');
export const FilterIcon = withInheritedSize(IconFilter, 'FilterIcon');
export const InboxIcon = withInheritedSize(IconInbox, 'InboxIcon');
export const MapPinIcon = withInheritedSize(IconMapPin, 'MapPinIcon');
export const MoonIcon = withInheritedSize(IconMoon, 'MoonIcon');
export const SearchIcon = withInheritedSize(IconSearch, 'SearchIcon');
export const SunIcon = withInheritedSize(IconSun, 'SunIcon');
export const TrashIcon = withInheritedSize(IconTrash, 'TrashIcon');
export const UserBadgeIcon = withInheritedSize(IconIdBadge2, 'UserBadgeIcon');
export const UserPlusIcon = withInheritedSize(IconUserPlus, 'UserPlusIcon');
export const XIcon = withInheritedSize(IconX, 'XIcon');
