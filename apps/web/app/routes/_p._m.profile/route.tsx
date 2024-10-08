import { useProtectedLayerData } from '~/shared/api';
import { Heading } from '~/shared/ui';
import action from './action.server';
import DeleteAccountForm from './DeleteAccountForm';
import ProfileAvatarEditor from './ProfileAvatarEditor';
import UserProfileForm from './UserProfileForm';

export { action };

export default function ProfilePage() {
  const { user, avatarFallback } = useProtectedLayerData();

  return (
    <div className="px-3 py-4 md:px-8">
      <Heading className="mb-3">Profile</Heading>
      <ProfileAvatarEditor
        avatarUrl={user?.avatarUrls?.original || ''}
        fallbackContent={avatarFallback}
      />
      <div className="max-w-md">
        <UserProfileForm />
      </div>
      {/* <h2 className="text-xl">Change password</h2> */}
      <Heading as="h2" className="mb-3 mt-6">
        Account settings
      </Heading>
      <DeleteAccountForm />
    </div>
  );
}
