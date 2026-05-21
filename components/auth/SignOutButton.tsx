type SignOutButtonProps = {
  className?: string;
  children?: React.ReactNode;
};

/** POST-only sign out — safe from Next.js Link prefetch (GET /logout does not clear the session). */
export function SignOutButton({ className, children = "Log out" }: SignOutButtonProps) {
  return (
    <form action="/logout" method="POST" className="contents">
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
