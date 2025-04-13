import { Link } from 'react-router-dom';
import { TemplatesIcon } from './icons/TemplatesIcon';

export function Navigation() {
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link
        to="/templates"
        className="flex items-center gap-2 text-sm font-medium hover:text-primary"
      >
        <TemplatesIcon className="h-4 w-4" />
        Templates
      </Link>
    </nav>
  );
} 