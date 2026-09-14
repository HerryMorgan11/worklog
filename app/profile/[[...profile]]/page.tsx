import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <main className="flex flex-1 justify-center p-6">
      <UserProfile path="/profile" routing="path" />
    </main>
  );
}
