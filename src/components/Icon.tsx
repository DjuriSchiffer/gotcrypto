import React from 'react';
import {
  FaArrowUp,
  FaArrowDown,
  FaArrowLeft,
  FaPen,
  FaTrashAlt,
  FaPlus,
  FaExclamationTriangle,
  FaUndoAlt,
  FaGithub,
  FaCalendar,
  FaCoins,
  FaEuroSign,
  FaSearch,
} from 'react-icons/fa';

type IconId =
  | 'Up'
  | 'Down'
  | 'Left'
  | 'Edit'
  | 'Remove'
  | 'Plus'
  | 'Close'
  | 'Warning'
  | 'Reload'
  | 'Github'
  | 'Calendar'
  | 'Amount'
  | 'Price'
  | 'Search';

interface IconProps {
  id: IconId;
  color: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ id, color, className }) => {
  switch (id) {
    case 'Up':
      return <FaArrowUp color={color} className={className} />;

    case 'Down':
      return <FaArrowDown color={color} className={className} />;

    case 'Left':
      return <FaArrowLeft color={color} className={className} />;

    case 'Edit':
      return <FaPen color={color} className={className} />;

    case 'Remove':
      return <FaTrashAlt color={color} className={className} />;

    case 'Plus':
      return <FaPlus color={color} className={className} />;

    case 'Close':
      return <FaPlus color={color} className={'rotate-45'} />;

    case 'Warning':
      return <FaExclamationTriangle color={color} className={className} />;

    case 'Reload':
      return <FaUndoAlt color={color} className={className} />;

    case 'Github':
      return <FaGithub color={color} className={className} />;

    case 'Calendar':
      return <FaCalendar color={color} className={className} />;

    case 'Amount':
      return <FaCoins color={color} className={className} />;

    case 'Price':
      return <FaEuroSign color={color} className={className} />;

    case 'Search':
      return <FaSearch color={color} className={className} />;
    default:
      return null;
  }
};

export default Icon;
