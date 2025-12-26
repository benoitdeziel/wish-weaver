import {
  // RedirectToSignIn,
  SignedIn,
  UserButton,
} from '@neondatabase/neon-js/auth/react/ui'

export default function HeaderUser() {
  return (
    <>
      <SignedIn>
        <div>
          <h1>Welcome!</h1>
          <p>You're successfully authenticated.</p>
          <UserButton />
        </div>
      </SignedIn>
      {/* <RedirectToSignIn /> */}
    </>
  )
}
