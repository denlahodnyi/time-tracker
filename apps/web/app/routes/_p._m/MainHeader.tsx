import { Link } from '@remix-run/react';
import { LogOutIcon, User2Icon } from 'lucide-react';

import { userApi } from '~/entities/user';
import {
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/shared/ui';

export default function MainHeader() {
  const { logout } = userApi.useLogout();
  const { data: user } = userApi.useCurrentUser();
  const { firstName = '', lastName = '' } = user || {};
  const avatarFallback = `${firstName.at(0)}${lastName?.at(0) || ''}`;

  return (
    <header className="sticky top-0 flex border border-b-ring bg-background px-5 py-2">
      <DropdownMenu>
        <DropdownMenuTrigger className="ml-auto mr-0">
          <Avatar className="border border-border">
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
