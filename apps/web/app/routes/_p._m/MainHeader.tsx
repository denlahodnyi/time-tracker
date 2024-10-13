import { Link, useLocation } from '@remix-run/react';
import { HouseIcon, LogOutIcon, User2Icon } from 'lucide-react';

import { useLogout, useProtectedLayerData } from '~/shared/api';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/shared/ui';

export default function MainHeader() {
  const { logout } = useLogout();
  const location = useLocation();
  const { user, avatarFallback } = useProtectedLayerData();

  return (
    <header className="sticky top-0 z-30 flex items-center border-b border-b-primary bg-background px-3 py-2 md:px-5">
      {location.pathname !== '/' && (
        <Button
          asChild
          aria-label="Go home"
          className="h-10 w-10 rounded-full p-0"
          variant="ghost"
        >
          <Link to="/">
            <HouseIcon className="h-6 w-6" />
          </Link>
        </Button>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Show site menu"
          className="ml-auto mr-0"
        >
          <Avatar className="h-10 w-10 border border-border text-lg md:h-12 md:w-12 md:text-xl">
            <AvatarImage src={user?.avatarUrls.thumbnail} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <Link className="flex" to="/profile">
              <User2Icon className="mr-1" size={16} />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onSelect={logout}>
            <LogOutIcon className="mr-1" size={16} /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
