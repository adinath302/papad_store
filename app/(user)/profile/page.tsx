import Link from "next/link";

const Profile = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center mt-10">User Profile</h1>
      <Link href="/orders">Orders</Link>
    </div>
  );
};

export default Profile;
