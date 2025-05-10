import { SignIn } from "@/components/auth/SignIn";
import { SignUp } from "@/components/auth/SignUp";

export default function Page() {
  return (
    <>
      <div className="my-4">
        <SignIn />
      </div>
      <div className="my-4">
        <SignUp />
      </div>
    </>
  );
}
